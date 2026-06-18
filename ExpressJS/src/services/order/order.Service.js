import { Op } from 'sequelize';
import db from '../../entities/index.js';
import voucherService from '../voucher/voucher.service.js';
import paymentService from '../payment/payment.service.js';
import { ORDER_STATUS } from '../../constants/order.constants.js';
import { PAYMENT_METHOD } from '../../constants/payment.constants.js';

const { Order, OrderItem, OrderStatusHistory, Payment, Cart, CartItem, Product, User, UserVoucher, RewardTransaction, Voucher, sequelize } = db;

const createStatusHistory = async (orderId, status, note, changedBy, transaction) => {
  return OrderStatusHistory.create({ orderId, status, note, changedBy }, { transaction });
};

const createOrder = async (userId, { shippingAddress, phoneNumber, note, paymentMethod = 'COD', items, couponCode = null, pointsToUse = 0 }, req) => {
  const t = await sequelize.transaction();

  try {
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

    const availablePoints = Number(user.pointsBalance);
    const pointsToRedeem = Math.max(0, Math.min(Number(pointsToUse) || 0, availablePoints, totalAfterVoucher));
    
    if (pointsToUse > availablePoints) {
        throw new Error('Số điểm sử dụng không được vượt quá số điểm hiện có.');
    }

    const pointsDiscount = pointsToRedeem;
    const finalTotal = totalAfterVoucher - pointsDiscount;

    if (finalTotal < 0) throw new Error('Tổng giá trị đơn hàng không hợp lệ.');

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

    await Payment.create({
      orderId: order.id,
      method: paymentMethod,
      status: 'PENDING',
      amount: finalTotal
    }, { transaction: t });
    await createStatusHistory(order.id, ORDER_STATUS.NEW, 'Đơn hàng mới được tạo.', userId, t);

    if (userVoucher) {
      await userVoucher.update({ status: false, usedAt: new Date() }, { transaction: t });
    }

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

    for (const item of orderableItems) {
        await Product.update(
            { stock: sequelize.literal(`stock - ${item.quantity}`) },
            { where: { id: item.productId }, transaction: t }
        );
    }

    await t.commit();

    let paymentUrl = null;
    if (paymentMethod === PAYMENT_METHOD.VNPAY) {
        const ipAddr = req?.headers?.['x-forwarded-for']
          || req?.connection?.remoteAddress
          || req?.ip
          || '127.0.0.1';
        paymentUrl = await paymentService.createPaymentUrl(order.id, finalTotal, ipAddr);
    }

    const orderData = order.get({ plain: true });
    orderData.paymentUrl = paymentUrl;

    return orderData;

  } catch (error) {
    await t.rollback();
    console.error('Lỗi khi tạo đơn hàng:', error);
    throw error;
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

const transitionOrderStatus = async (order, newStatus, { changedBy, note }) => {
  const t = await sequelize.transaction();
  try {
    order.status = newStatus;
    if (newStatus === ORDER_STATUS.CONFIRMED) {
      order.confirmedAt = new Date();
    }
    if (newStatus === ORDER_STATUS.CANCEL_REQUEST) {
      order.cancelRequestedAt = new Date();
    }
    await order.save({ transaction: t });
    await createStatusHistory(order.id, newStatus, note, changedBy, t);
    await t.commit();
    return { success: true, message: `Chuyển trạng thái đơn hàng thành ${newStatus}`, order };
  } catch (error) {
    await t.rollback();
    throw error;
  }
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

const handleCancelRequest = async (adminId, orderId, approve) => {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Không tìm thấy đơn hàng');

    if (order.status !== ORDER_STATUS.CANCEL_REQUEST) {
        throw new Error('Đơn hàng không ở trạng thái yêu cầu hủy');
    }

    if (approve) {
        return transitionOrderStatus(order, ORDER_STATUS.CANCELLED, {
            changedBy: adminId,
            note: 'Admin đã duyệt yêu cầu hủy đơn'
        });
    } else {
        return transitionOrderStatus(order, ORDER_STATUS.CONFIRMED, {
            changedBy: adminId,
            note: 'Admin từ chối yêu cầu hủy đơn'
        });
    }
}
  
export default {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  handleCancelRequest
};
