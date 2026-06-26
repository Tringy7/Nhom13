import { Op } from 'sequelize';
import db from '../../entities/index.js';
import paymentService from '../payment/payment.service.js';
import { ORDER_STATUS, ORDER_DETAIL_STATUS } from '../../constants/order.constants.js';
import { PAYMENT_METHOD } from '../../constants/payment.constants.js';
import { REWARD_TYPE } from '../../constants/reward.constants.js';
import { createRewardHistory } from '../reward/reward.service.js';

const {
    Order,
    OrderDetail,
    Payment,
    Cart,
    CartItem,
    Product,
    User,
    UserVoucher,
    Voucher,
    OrderCancellationRequest,
    sequelize
} = db;

const createOrder = async (userId, {
    fullName,
    phoneNumber,
    shippingAddress,
    note,
    paymentMethod = 'COD',
    items,
    voucherId = null,
    pointsToUse = 0
}, req) => {
    const t = await sequelize.transaction();
    try {
        const user = await User.findByPk(userId, { transaction: t });
        if (!user) throw new Error('Người dùng không tồn tại.');

        const productIds = items.map(item => item.productId);
        const productsInDb = await Product.findAll({ where: { id: productIds }, transaction: t, lock: t.LOCK.UPDATE });

        const orderableItems = items.map(item => {
            const product = productsInDb.find(p => p.id === item.productId);
            if (!product) throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại.`);
            if (product.stock < item.quantity) throw new Error(`Sản phẩm "${product.name}" không đủ số lượng.`);
            return {
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                price: Number(product.price),
            };
        });

        if (orderableItems.length === 0) throw new Error('Không có sản phẩm nào để thanh toán.');

        const subtotal = orderableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        let voucherDiscount = 0;
        let pointsDiscount = 0;
        let appliedVoucherId = null;
        let userVoucher = null;

        if (voucherId) {
            userVoucher = await UserVoucher.findOne({
                where: { voucherId: voucherId, userId: userId, isUsed: false },
                include: [{ model: Voucher, as: 'voucher' }],
                transaction: t
            });

            if (!userVoucher) throw new Error('Voucher không hợp lệ hoặc đã được sử dụng.');
            const voucher = userVoucher.voucher;
            if (new Date(voucher.endDate) < new Date()) throw new Error('Voucher đã hết hạn.');
            if (subtotal < voucher.minOrderValue) throw new Error(`Đơn hàng chưa đạt giá trị tối thiểu ${voucher.minOrderValue.toLocaleString()}đ để dùng voucher.`);

            if (voucher.discountType === 'FIXED') {
                voucherDiscount = voucher.discountValue;
            } else { // PERCENT
                voucherDiscount = Math.min((subtotal * voucher.discountValue) / 100, voucher.maxDiscountAmount || Infinity);
            }
            appliedVoucherId = voucher.id;
        }

        const pointsToRedeem = Number(pointsToUse) || 0;
        if (pointsToRedeem > 0) {
            if (user.points < pointsToRedeem) {
                throw new Error('Số điểm sử dụng vượt quá số điểm hiện có.');
            }
            pointsDiscount = pointsToRedeem;
        }

        if (pointsDiscount > subtotal - voucherDiscount) {
            pointsDiscount = Math.max(0, subtotal - voucherDiscount);
        }

        const finalTotalWithCorrection = Math.max(0, subtotal - voucherDiscount - pointsDiscount);

        const order = await Order.create({
            userId,
            fullName,
            phoneNumber,
            shippingAddress,
            note,
            subtotal,
            voucherDiscount,
            pointsDiscount,
            totalAmount: finalTotalWithCorrection,
            shippingFee: 0,
            orderStatus: ORDER_STATUS.NEW,
            voucherId: appliedVoucherId,
            shippingMethod: 'Giao hàng tiêu chuẩn'
        }, { transaction: t });

        const orderDetailsData = orderableItems.map(item => ({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            status: ORDER_DETAIL_STATUS.EXISTED,
        }));
        await OrderDetail.bulkCreate(orderDetailsData, { transaction: t });

        await Payment.create({
            orderId: order.id,
            method: paymentMethod,
            status: 'PENDING',
            amount: finalTotalWithCorrection
        }, { transaction: t });

        if (userVoucher) {
            await userVoucher.update({ isUsed: true, orderId: order.id }, { transaction: t });
        }

        if (pointsDiscount > 0) {
            await user.decrement('points', { by: pointsDiscount, transaction: t });
            await createRewardHistory(
                userId,
                pointsDiscount,
                REWARD_TYPE.USE,
                `Sử dụng ${pointsDiscount} điểm cho đơn hàng #${order.id}`,
                { transaction: t }
            );
        }

        const cart = await Cart.findOne({ where: { userId } });
        if (cart) {
            await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });
        }
        for (const item of orderableItems) {
            await Product.decrement('stock', { by: item.quantity, where: { id: item.productId }, transaction: t });
        }

        await t.commit();

        let paymentUrl = null;
        if (paymentMethod === PAYMENT_METHOD.VNPAY && finalTotalWithCorrection > 0) {
            const ipAddr = req?.headers?.['x-forwarded-for'] || req?.ip || '127.0.0.1';
            paymentUrl = await paymentService.createPaymentUrl(order.id, finalTotalWithCorrection, ipAddr);
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

const cancelOrderItem = async (userId, orderId, orderItemId) => {
    const t = await sequelize.transaction();
    try {
        const order = await Order.findOne({
            where: { id: orderId, userId },
            include: [{ model: OrderDetail, as: 'details' }],
            transaction: t
        });

        if (!order) throw new Error('Không tìm thấy đơn hàng.');
        if (![ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED].includes(order.orderStatus)) {
            throw new Error('Chỉ có thể hủy sản phẩm khi đơn hàng ở trạng thái "Mới" hoặc "Đã xác nhận".');
        }

        const itemToCancel = order.details.find(item => item.id === orderItemId);
        if (!itemToCancel) throw new Error('Sản phẩm không tồn tại trong đơn hàng.');
        if (itemToCancel.status === ORDER_DETAIL_STATUS.CANCELLED) {
            throw new Error('Sản phẩm này đã được hủy trước đó.');
        }

        await itemToCancel.update({ status: ORDER_DETAIL_STATUS.CANCELLED }, { transaction: t });
        await Product.increment('stock', { by: itemToCancel.quantity, where: { id: itemToCancel.productId }, transaction: t });

        const remainingItems = order.details.filter(item => item.id !== orderItemId && item.status === ORDER_DETAIL_STATUS.EXISTED);
        const newSubtotal = remainingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        let newVoucherDiscount = 0;
        if (order.voucherId) {
            const voucher = await Voucher.findByPk(order.voucherId, { transaction: t });
            if (voucher && newSubtotal >= voucher.minOrderValue) {
                if (voucher.discountType === 'FIXED') {
                    newVoucherDiscount = voucher.discountValue;
                } else {
                    newVoucherDiscount = Math.min((newSubtotal * voucher.discountValue) / 100, voucher.maxDiscountAmount || Infinity);
                }
            } else {
                const userVoucher = await UserVoucher.findOne({ where: { orderId: order.id }, transaction: t });
                if (userVoucher) {
                    await userVoucher.update({ isUsed: false, orderId: null }, { transaction: t });
                }
            }
        }

        const newFinalTotal = Math.max(0, newSubtotal - newVoucherDiscount - (order.pointsDiscount || 0));
        await order.update({ totalAmount: newFinalTotal, subtotal: newSubtotal, voucherDiscount: newVoucherDiscount }, { transaction: t });

        const allItemsCancelled = order.details.every(item => item.status === ORDER_DETAIL_STATUS.CANCELLED);
        if (allItemsCancelled) {
            await order.update({ orderStatus: ORDER_STATUS.CANCELLED }, { transaction: t });
            const user = await User.findByPk(userId, { transaction: t });
            if (user && order.pointsDiscount > 0) {
                await user.increment('points', { by: Math.ceil(order.pointsDiscount), transaction: t });
                await createRewardHistory(userId, Math.ceil(order.pointsDiscount), REWARD_TYPE.EARN, `Hoàn điểm do hủy đơn hàng #${order.id}`, { transaction: t });
            }
            const userVoucher = await UserVoucher.findOne({ where: { orderId: order.id }, transaction: t });
            if (userVoucher) {
                await userVoucher.update({ isUsed: false, orderId: null }, { transaction: t });
            }
        }

        await t.commit();
        return order;
    } catch (error) {
        await t.rollback();
        console.error('Lỗi khi hủy sản phẩm trong đơn hàng:', error);
        throw error;
    }
};

const getOrders = async (userId) => {
    const { Order, OrderItem, Product, Payment } = db;
    return Order.findAll({
        where: { userId },
        include: [
            {
                model: OrderDetail,
                as: 'details',
                attributes: ['id', 'quantity', 'price', 'status'],
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'price', 'thumbnail', 'stock']
                }]
            },
            { model: Payment, as: 'payment', attributes: ['method', 'status'] }
        ],
        order: [['createdAt', 'DESC']]
    });
};

const getOrderById = async (userId, orderId) => {
    const order = await Order.findOne({
        where: { id: orderId, userId },
        include: [
            {
                model: OrderDetail,
                as: 'details',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'price', 'thumbnail', 'stock']
                }]
            },
            {
                model: Payment,
                as: 'payment',
            },
            { model: User, as: 'shipper', attributes: ['fullName', 'phone'] }
        ]
    });
    if (!order) throw new Error('Không tìm thấy đơn hàng');
    return order;
};

const requestCancelOrder = async (userId, orderId, reason) => {
    const order = await Order.findOne({ where: { id: orderId, userId } });
    if (!order) throw new Error('Không tìm thấy đơn hàng');

    if (![ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED].includes(order.orderStatus)) {
        throw new Error('Chỉ có thể yêu cầu hủy đơn hàng ở trạng thái "Mới" hoặc "Đã xác nhận".');
    }

    const existingRequest = await OrderCancellationRequest.findOne({ where: { orderId } });
    if (existingRequest) {
        throw new Error('Bạn đã gửi yêu cầu hủy cho đơn hàng này rồi.');
    }

    await order.update({ orderStatus: ORDER_STATUS.CANCEL_REQUEST });

    const cancellationRequest = await OrderCancellationRequest.create({
        orderId,
        userId,
        reason,
        status: 'PENDING'
    });

    return cancellationRequest;
};

const cancelOrder = async (userId, orderId) => {
  const { Order } = db;
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
  const { Order, User, OrderItem, Product } = db;
  return Order.findAll({
    include: [
      { model: User, as: 'customer', attributes: ['id', 'fullName', 'email'] },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }] }
    ],
    order: [['createdAt', 'DESC']]
  });
};
  
const getAdminOrderById = async (orderId) => {
  const { Order, User, OrderItem, Product } = db;
  const order = await Order.findOne({
    where: { id: orderId },
    include: [
      { model: User, as: 'customer' },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
    ]
  });
  if (!order) throw new Error('Không tìm thấy đơn hàng');
  return order;
};
  
const updateOrderStatus = async (adminId, orderId, nextStatus, note = null) => {
  const { Order } = db;
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
    const { Order } = db;
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Không tìm thấy đơn hàng');

    await order.update({
        orderStatus: status,
        shipperId: shipperId || order.shipperId
    });

    return order;
};

const handleCancelRequest = async (adminId, requestId, { approve, adminNotes = '' }) => {
    const request = await OrderCancellationRequest.findByPk(requestId, { include: [Order] });
    if (!request) throw new Error('Không tìm thấy yêu cầu hủy.');

    if (request.status !== 'PENDING') {
        throw new Error('Yêu cầu này đã được xử lý.');
    }

    const order = request.Order;
    const now = new Date();

    if (approve) {
        await request.update({
            status: 'APPROVED',
            approvedBy: adminId,
            adminNotes,
            processedAt: now
        });
        await order.update({ orderStatus: ORDER_STATUS.CANCELLED });
    } else {
        await request.update({
            status: 'REJECTED',
            approvedBy: adminId,
            adminNotes,
            processedAt: now
        });
        await order.update({ orderStatus: ORDER_STATUS.CONFIRMED });
    }
    return request;
}

export default {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrderItem,
    requestCancelOrder,
    getAdminOrders,
    getAdminOrderById,
    updateOrderStatus,
    handleCancelRequest
};