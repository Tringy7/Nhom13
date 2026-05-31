import { Op } from 'sequelize';
import db from '../../models/index.js';
import voucherService from '../voucher/voucher.service.js';

const { Order, OrderItem, OrderStatusHistory, Payment, Cart, CartItem, Product, User, UserVoucher, RewardTransaction, sequelize } = db;

const ORDER_STATUS = {
  NEW: 'new',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  CANCEL_REQUEST: 'cancel_request'
};

const createStatusHistory = async (orderId, status, note, changedBy, transaction) => {
  return OrderStatusHistory.create({ orderId, status, note, changedBy }, { transaction });
};

const createOrder = async (userId, { shippingAddress, phoneNumber, note, paymentMethod = 'COD', items, couponCode = null, pointsToUse = 0 }) => {
  const t = await sequelize.transaction(); // BẮT ĐẦU TRANSACTION

  try {
    // 1. Lấy thông tin user và sản phẩm
    const user = await User.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!user) throw new Error('Người dùng không tồn tại.');

    const productIds = items.map(item => item.productId);
    const productsInDb = await Product.findAll({ where: { id: productIds }, transaction: t });

    const orderableItems = items.map(item => {
      const product = productsInDb.find(p => p.id === item.productId);
      if (!product) throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại.`);
      if (product.stock < item.quantity) throw new Error(`Sản phẩm "${product.name}" không đủ số lượng.`);
      return {
        productId: product.id,
        quantity: item.quantity,
        price: Number(product.price),
        product: product
      };
    });

    if (orderableItems.length === 0) throw new Error('Không có sản phẩm nào để thanh toán.');

    // 2. Tính toán giá trị đơn hàng
    const subtotal = orderableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let voucherDiscount = 0;
    let userVoucher = null;

    if (couponCode) {
      userVoucher = await UserVoucher.findOne({
        where: { userId, rewardCode: couponCode, status: true },
        include: { model: Voucher, as: 'voucher' },
        transaction: t
      });
      if (!userVoucher) throw new Error('Mã giảm giá không hợp lệ hoặc đã được sử dụng.');
      
      const voucherResult = await voucherService.applyVoucher(userId, couponCode, subtotal);
      voucherDiscount = voucherResult.discountAmount;
    }

    const totalAfterVoucher = subtotal - voucherDiscount;

    // 3. Validate và tính toán điểm thưởng sử dụng
    const availablePoints = Number(user.pointsBalance);
    const pointsToRedeem = Math.max(0, Math.min(Number(pointsToUse) || 0, availablePoints, totalAfterVoucher));
    
    if (pointsToUse > availablePoints) {
        throw new Error('Số điểm sử dụng không được vượt quá số điểm hiện có.');
    }

    const pointsDiscount = pointsToRedeem; // 1 point = 1 VND
    const finalTotal = totalAfterVoucher - pointsDiscount;

    if (finalTotal < 0) throw new Error('Tổng giá trị đơn hàng không hợp lệ.');

    // 4. Tạo Order và OrderItems
    const order = await Order.create({
      userId,
      totalPrice: finalTotal,
      originalTotalPrice: subtotal,
      discountAmount: voucherDiscount + pointsDiscount,
      couponCode: couponCode,
      pointsRedeemed: pointsToRedeem,
      shippingAddress,
      phoneNumber,
      note,
      status: ORDER_STATUS.NEW
    }, { transaction: t });

    const orderItemsData = orderableItems.map(item => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }));
    await OrderItem.bulkCreate(orderItemsData, { transaction: t });

    // 5. Tạo Payment và Status History
    await Payment.create({
      orderId: order.id,
      method: paymentMethod,
      status: 'pending',
      amount: finalTotal
    }, { transaction: t });
    await createStatusHistory(order.id, ORDER_STATUS.NEW, 'Đơn hàng mới được tạo.', userId, t);

    // 6. Cập nhật Voucher (nếu có)
    if (userVoucher) {
      await userVoucher.update({ status: false, usedAt: new Date() }, { transaction: t });
    }

    // 7. Trừ điểm thưởng và tạo transaction (nếu có)
    if (pointsToRedeem > 0) {
      const newBalance = availablePoints - pointsToRedeem;
      await user.update({ pointsBalance: newBalance }, { transaction: t });
      await RewardTransaction.create({
        userId,
        type: 'SPEND',
        points: pointsToRedeem,
        description: `Sử dụng điểm cho đơn hàng #${order.id}`,
        orderId: order.id
      }, { transaction: t });
    }

    // 8. Xóa sản phẩm đã mua khỏi giỏ hàng
    const cart = await Cart.findOne({ where: { userId } });
    if (cart) {
        const productIdsToRemove = orderableItems.map(item => item.productId);
        await CartItem.destroy({
            where: {
                cartId: cart.id,
                productId: { [Op.in]: productIdsToRemove }
            },
            transaction: t
        });
    }

    // 9. Cập nhật stock sản phẩm
    for (const item of orderableItems) {
        await Product.update(
            { stock: sequelize.literal(`stock - ${item.quantity}`) },
            { where: { id: item.productId }, transaction: t }
        );
    }

    await t.commit(); // COMMIT TRANSACTION
    return order;

  } catch (error) {
    await t.rollback(); // ROLLBACK NẾU CÓ LỖI
    console.error('Lỗi khi tạo đơn hàng:', error);
    throw error; // Ném lỗi ra để controller bắt
  }
};

const getOrders = async (userId) => {
    return Order.findAll({
      where: { userId },
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'thumbnail'] }] },
        { model: Payment, as: 'payment', attributes: ['method', 'status', 'amount', 'paidAt'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  };
  
  const getOrderById = async (userId, orderId) => {
    const order = await Order.findOne({
      where: { id: orderId, userId },
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'thumbnail', 'price'] }] },
        { model: Payment, as: 'payment' }
      ]
    });
    if (!order) throw new Error('Không tìm thấy đơn hàng');
    return order;
  };
  
  const cancelOrder = async (userId, orderId) => {
    const order = await Order.findOne({ where: { id: orderId, userId } });
    if (!order) throw new Error('Không tìm thấy đơn hàng');
  
    if (![ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED].includes(order.status)) {
      throw new Error('Chỉ có thể hủy đơn hàng ở trạng thái mới hoặc đã xác nhận.');
    }
  
    return transitionOrderStatus(order, ORDER_STATUS.CANCELLED, {
      changedBy: userId,
      note: 'Người dùng đã hủy đơn hàng.'
    });
  };
  
  const getAdminOrders = async () => {
    return Order.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });
  };
  
  const getAdminOrderById = async (orderId) => {
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        { model: User, as: 'user' },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });
    if (!order) throw new Error('Không tìm thấy đơn hàng');
    return order;
  };
  
  const updateOrderStatus = async (adminId, orderId, nextStatus, note = null) => {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Không tìm thấy đơn hàng');
  
    const allowedTransitions = {
      [ORDER_STATUS.NEW]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.PREPARING]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED],
      [ORDER_STATUS.DELIVERED]: [],
      [ORDER_STATUS.CANCELLED]: [],
      [ORDER_STATUS.CANCEL_REQUEST]: [ORDER_STATUS.CANCELLED]
    };
  
    const allowed = allowedTransitions[order.status] || [];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`Không thể chuyển từ trạng thái ${order.status} sang ${nextStatus}`);
    }
  
    return transitionOrderStatus(order, nextStatus, {
      changedBy: adminId,
      note
    });
  };
  
  export default {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    getAdminOrders,
    getAdminOrderById,
    updateOrderStatus
  };