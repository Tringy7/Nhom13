import { Op, fn, col, literal } from "sequelize";
import db from "../../entities/index.js";
import bcrypt from "bcryptjs";

const { User, Order, OrderDetail, Payment, Voucher, OrderCancellationRequest, Product, SystemSetting, sequelize } = db;

const ROLE = {
  ADMIN: "admin",
  MANAGER: "manager",
  SHIPPER: "shipper",
  USER: "user",
};

const ORDER_STATUS = {
  NEW: "NEW",
  CONFIRMED: "CONFIRMED",
  SHIPPING: "SHIPPING",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  CANCEL_REQUEST: "CANCEL_REQUEST",
};

const ORDER_DETAIL_STATUS = {
    EXISTED: 'EXISTED',
    CANCELLED: 'CANCELLED',
    PENDING: 'PENDING'
};

const SYSTEM_SETTING_DEFAULTS = [
  { key: 'storeName', label: 'Tên cửa hàng', value: 'UTESHOP', group: 'store', inputType: 'text' },
  { key: 'storeEmail', label: 'Email cửa hàng', value: 'support@uteshop.vn', group: 'store', inputType: 'email' },
  { key: 'storePhone', label: 'Hotline', value: '1900 0000', group: 'store', inputType: 'text' },
  { key: 'storeAddress', label: 'Địa chỉ cửa hàng', value: 'TP. Hồ Chí Minh', group: 'store', inputType: 'textarea' },
  { key: 'defaultShippingFee', label: 'Phí ship mặc định', value: '30000', group: 'policy', inputType: 'number' },
  { key: 'warrantyPolicy', label: 'Chính sách bảo hành', value: 'Bảo hành chính hãng theo từng sản phẩm.', group: 'policy', inputType: 'textarea' },
  { key: 'returnPolicy', label: 'Chính sách đổi trả', value: 'Hỗ trợ đổi trả trong 7 ngày nếu sản phẩm lỗi từ nhà sản xuất.', group: 'policy', inputType: 'textarea' },
  { key: 'maintenanceMode', label: 'Chế độ bảo trì', value: 'false', group: 'system', inputType: 'boolean' },
];

const VALID_ROLES = Object.values(ROLE);

const ensureSystemSettings = async () => {
  await SystemSetting.sync();

  await Promise.all(SYSTEM_SETTING_DEFAULTS.map((setting) =>
    SystemSetting.findOrCreate({
      where: { key: setting.key },
      defaults: setting,
    })
  ));
};

const normalizeOrder = (order) => {
  const data = typeof order?.toJSON === "function" ? order.toJSON() : order;
  if (!data) return data;

  return {
    ...data,
    user: data.user || data.customer || null,
    orderDetails: data.orderDetails || data.details || [],
  };
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const [
    totalUsers, totalManagers, totalShippers,
    totalProducts, totalOrders,
    revenueResult, newOrders, shippingOrders, completedOrders
  ] = await Promise.all([
    User.count({ where: { role: ROLE.USER } }),
    User.count({ where: { role: ROLE.MANAGER } }),
    User.count({ where: { role: ROLE.SHIPPER } }),
    Product.count(),
    Order.count(),
    Order.sum("totalAmount", { where: { orderStatus: ORDER_STATUS.DELIVERED } }),
    Order.count({ where: { orderStatus: ORDER_STATUS.NEW } }),
    Order.count({ where: { orderStatus: ORDER_STATUS.SHIPPING } }),
    Order.count({ where: { orderStatus: ORDER_STATUS.DELIVERED } }),
  ]);

  return {
    totalUsers, totalManagers, totalShippers,
    totalProducts, totalOrders,
    totalRevenue: revenueResult || 0,
    newOrders, shippingOrders, completedOrders,
  };
};

// ─── USER ────────────────────────────────────────────────────────────────────
export const getUsers = async ({ page = 1, limit = 10, search = "" }) => {
  const offset = (page - 1) * limit;
  const where = { role: ROLE.USER };
  if (search) {
    where[Op.or] = [
      { fullName: { [Op.like]: `%${search}%` } },
      { email:    { [Op.like]: `%${search}%` } },
      { phone:    { [Op.like]: `%${search}%` } },
    ];
  }
  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ["password"] },
    limit: +limit, offset,
    order: [["createdAt", "DESC"]],
  });
  return { total: count, page: +page, limit: +limit, data: rows };
};

export const getUserById = async (id) => {
  const user = await User.findOne({
    where: { id, role: ROLE.USER },
    attributes: { exclude: ["password"] },
  });
  if (!user) throw new Error("User not found");
  return user;
};

export const lockUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");
  await user.update({ status: "LOCKED" });
  return user;
};

export const unlockUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");
  await user.update({ status: "ACTIVE" });
  return user;
};

export const changeUserRole = async (id, role, actorId) => {
  const normalizedRole = String(role || "").toLowerCase();
  if (!VALID_ROLES.includes(normalizedRole)) {
    throw new Error("Invalid role");
  }

  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");
  if (Number(id) === Number(actorId)) {
    throw new Error("You cannot change your own role");
  }

  await user.update({ role: normalizedRole });
  const { password: _, ...data } = user.toJSON();
  return data;
};

// ─── MANAGER ─────────────────────────────────────────────────────────────────
export const createManager = async ({ fullName, email, phone, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error("Email already exists");
  const hashed = await bcrypt.hash(password, 10);
  const manager = await User.create({ fullName, email, phone, password: hashed, role: ROLE.MANAGER, status: "ACTIVE" });
  const { password: _, ...data } = manager.toJSON();
  return data;
};

export const getManagers = async ({ page = 1, limit = 10, search = "" }) => {
  const offset = (page - 1) * limit;
  const where = { role: ROLE.MANAGER };
  if (search) {
    where[Op.or] = [
      { fullName: { [Op.like]: `%${search}%` } },
      { email:    { [Op.like]: `%${search}%` } },
    ];
  }
  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ["password"] },
    limit: +limit, offset,
    order: [["createdAt", "DESC"]],
  });
  return { total: count, page: +page, limit: +limit, data: rows };
};

export const updateManager = async (id, { fullName, phone }) => {
  const manager = await User.findOne({ where: { id, role: ROLE.MANAGER } });
  if (!manager) throw new Error("Manager not found");
  await manager.update({ fullName, phone });
  const { password: _, ...data } = manager.toJSON();
  return data;
};

export const lockManager = async (id) => {
  const m = await User.findOne({ where: { id, role: ROLE.MANAGER } });
  if (!m) throw new Error("Manager not found");
  await m.update({ status: "LOCKED" });
  return m;
};

export const unlockManager = async (id) => {
  const m = await User.findOne({ where: { id, role: ROLE.MANAGER } });
  if (!m) throw new Error("Manager not found");
  await m.update({ status: "ACTIVE" });
  return m;
};

export const resetManagerPassword = async (id) => {
  const m = await User.findOne({ where: { id, role: ROLE.MANAGER } });
  if (!m) throw new Error("Manager not found");
  const hashed = await bcrypt.hash("Manager@123", 10);
  await m.update({ password: hashed });
  return { message: "Password reset to Manager@123" };
};

// ─── SHIPPER ─────────────────────────────────────────────────────────────────
export const createShipper = async ({ fullName, email, phone, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error("Email already exists");
  const hashed = await bcrypt.hash(password, 10);
  const shipper = await User.create({ fullName, email, phone, password: hashed, role: ROLE.SHIPPER, status: "ACTIVE" });
  const { password: _, ...data } = shipper.toJSON();
  return data;
};

export const getShippers = async ({ page = 1, limit = 10, search = "" }) => {
  const offset = (page - 1) * limit;
  const where = { role: ROLE.SHIPPER };
  if (search) {
    where[Op.or] = [
      { fullName: { [Op.like]: `%${search}%` } },
      { email:    { [Op.like]: `%${search}%` } },
    ];
  }
  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ["password"] },
    limit: +limit, offset,
    order: [["createdAt", "DESC"]],
  });
  return { total: count, page: +page, limit: +limit, data: rows };
};

export const updateShipper = async (id, { fullName, phone }) => {
  const s = await User.findOne({ where: { id, role: ROLE.SHIPPER } });
  if (!s) throw new Error("Shipper not found");
  await s.update({ fullName, phone });
  const { password: _, ...data } = s.toJSON();
  return data;
};

export const lockShipper = async (id) => {
  const s = await User.findOne({ where: { id, role: ROLE.SHIPPER } });
  if (!s) throw new Error("Shipper not found");
  await s.update({ status: "LOCKED" });
  return s;
};

export const unlockShipper = async (id) => {
  const s = await User.findOne({ where: { id, role: ROLE.SHIPPER } });
  if (!s) throw new Error("Shipper not found");
  await s.update({ status: "ACTIVE" });
  return s;
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────
export const getOrders = async ({ page = 1, limit = 10, status = "" }) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (status) where.orderStatus = status;

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      { model: User, as: "customer", attributes: ["id","fullName","email","phone"] },
      { model: User, as: "shipper", attributes: ["id","fullName","phone"], required: false },
      { model: Payment, as: "payment", required: false },
      { model: Voucher, as: "voucher", required: false },
    ],
    limit: +limit, offset,
    order: [["createdAt", "DESC"]],
    distinct: true,
  });
  return { total: count, page: +page, limit: +limit, data: rows.map(normalizeOrder) };
};

export const getOrderById = async (id) => {
  const order = await Order.findByPk(id, {
    include: [
      { model: User, as: "customer", attributes: ["id","fullName","email","phone"] },
      { model: User, as: "shipper", attributes: ["id","fullName","phone"], required: false },
      { model: OrderDetail, as: "details" },
      { model: Payment, as: "payment", required: false },
      { model: Voucher, as: "voucher", required: false },
    ],
  });
  if (!order) throw new Error("Order not found");
  return normalizeOrder(order);
};

// ─── CANCEL REQUESTS ─────────────────────────────────────────────────────────
export const getCancelRequests = async ({ page = 1, limit = 10, status = "" }) => {
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await OrderCancellationRequest.findAndCountAll({
        where,
        include: [
            { model: Order, as: "order" },
            { model: User, as: "user", attributes: ["id", "fullName", "email"] },
            {
                model: OrderDetail,
                as: "orderDetail",
                include: [{ model: Product, as: "product" }]
            }
        ],
        limit: +limit, offset,
        order: [["createdAt", "DESC"]],
        distinct: true,
    });
    return { total: count, page: +page, limit: +limit, data: rows };
};

export const approveCancelRequest = async (id, adminId) => {
    const t = await sequelize.transaction();
    try {
        const request = await OrderCancellationRequest.findByPk(id, {
            include: [{ model: Order, as: "order", include: [{ model: OrderDetail, as: 'details' }] }],
            transaction: t
        });

        if (!request) throw new Error("Request not found");
        if (request.status !== "PENDING") throw new Error("Request already processed");

        await request.update({ status: "APPROVED", approvedBy: adminId, processedAt: new Date() }, { transaction: t });

        const orderDetail = await OrderDetail.findByPk(request.orderDetailId, { transaction: t });
        if (orderDetail) {
            await orderDetail.update({ status: ORDER_DETAIL_STATUS.CANCELLED }, { transaction: t });
        }

        const allItemsCancelled = request.order.details.every(
            detail => detail.id === request.orderDetailId || detail.status === ORDER_DETAIL_STATUS.CANCELLED
        );

        if (allItemsCancelled) {
            await request.order.update({ orderStatus: ORDER_STATUS.CANCELLED }, { transaction: t });
        }

        await t.commit();
        return request;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const rejectCancelRequest = async (id, adminId, rejectionReason) => {
    const t = await sequelize.transaction();
    try {
        const request = await OrderCancellationRequest.findByPk(id, { transaction: t });

        if (!request) throw new Error("Request not found");
        if (request.status !== "PENDING") throw new Error("Request already processed");

        await request.update({
            status: "REJECTED",
            approvedBy: adminId,
            rejectionReason,
            processedAt: new Date()
        }, { transaction: t });

        const orderDetail = await OrderDetail.findByPk(request.orderDetailId, { transaction: t });
        if (orderDetail) {
            await orderDetail.update({ status: ORDER_DETAIL_STATUS.EXISTED }, { transaction: t });
        }

        await t.commit();
        return request;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// ─── REVENUE ─────────────────────────────────────────────────────────────────
export const getRevenueReport = async () => {
  const daily = await Order.findAll({
    attributes: [
      [fn("DATE", col("createdAt")), "date"],
      [fn("SUM", col("totalAmount")), "revenue"],
      [fn("COUNT", col("id")), "orderCount"],
    ],
    where: {
      orderStatus: ORDER_STATUS.DELIVERED,
      createdAt: { [Op.gte]: literal("DATE_SUB(NOW(), INTERVAL 30 DAY)") },
    },
    group: [fn("DATE", col("createdAt"))],
    order: [[fn("DATE", col("createdAt")), "DESC"]],
    raw: true,
  });

  const monthly = await Order.findAll({
    attributes: [
      [fn("YEAR",  col("createdAt")), "year"],
      [fn("MONTH", col("createdAt")), "month"],
      [fn("SUM",   col("totalAmount")), "revenue"],
      [fn("COUNT", col("id")), "orderCount"],
    ],
    where: {
      orderStatus: ORDER_STATUS.DELIVERED,
      createdAt: { [Op.gte]: literal("DATE_SUB(NOW(), INTERVAL 12 MONTH)") },
    },
    group: [fn("YEAR", col("createdAt")), fn("MONTH", col("createdAt"))],
    order: [[fn("YEAR", col("createdAt")), "DESC"], [fn("MONTH", col("createdAt")), "DESC"]],
    raw: true,
  });

  const yearly = await Order.findAll({
    attributes: [
      [fn("YEAR", col("createdAt")), "year"],
      [fn("SUM",  col("totalAmount")), "revenue"],
      [fn("COUNT", col("id")), "orderCount"],
    ],
    where: { orderStatus: ORDER_STATUS.DELIVERED },
    group: [fn("YEAR", col("createdAt"))],
    order: [[fn("YEAR", col("createdAt")), "DESC"]],
    raw: true,
  });

  return { daily, monthly, yearly };
};

// ─── SYSTEM SETTINGS ────────────────────────────────────────────────────────
export const getSystemSettings = async () => {
  await ensureSystemSettings();

  const settings = await SystemSetting.findAll({
    order: [['group', 'ASC'], ['id', 'ASC']],
  });

  return settings;
};

export const updateSystemSettings = async (payload = {}) => {
  await ensureSystemSettings();

  const entries = Object.entries(payload).filter(([key]) =>
    SYSTEM_SETTING_DEFAULTS.some((setting) => setting.key === key)
  );

  await Promise.all(entries.map(([key, value]) =>
    SystemSetting.update(
      { value: value === undefined || value === null ? '' : String(value) },
      { where: { key } }
    )
  ));

  return getSystemSettings();
};
