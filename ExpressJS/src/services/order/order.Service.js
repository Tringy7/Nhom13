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

const getOrders = async (userId) => {
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
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'price', 'thumbnail', 'stock']
                    }
                ]
            },
            {
                model: Payment,
                as: 'payment',
            },
            { model: User, as: 'shipper', attributes: ['fullName', 'phone'] }
        ]
    });

    if (!order) throw new Error('Không tìm thấy đơn hàng');

    for (const detail of order.details) {
        const cancellationRequest = await OrderCancellationRequest.findOne({
            where: { orderDetailId: detail.id },
            order: [['createdAt', 'DESC']]
        });
        detail.dataValues.cancellationRequest = cancellationRequest;
    }

    return order;
};

const requestCancelOrderItem = async (userId, orderId, detailId, reason) => {
    const t = await sequelize.transaction();
    try {
        const order = await Order.findOne({
            where: { id: orderId, userId },
            include: [{ model: OrderDetail, as: 'details' }],
            transaction: t
        });

        if (!order) throw new Error('Không tìm thấy đơn hàng.');

        const orderDetail = order.details.find(d => d.id === detailId);
        if (!orderDetail) throw new Error('Sản phẩm không tồn tại trong đơn hàng này.');

        if (![ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED].includes(order.orderStatus)) {
            throw new Error('Chỉ có thể hủy sản phẩm khi đơn hàng ở trạng thái "Mới" hoặc "Đã xác nhận".');
        }

        if (orderDetail.status === ORDER_DETAIL_STATUS.CANCELLED) {
            throw new Error('Sản phẩm này đã được hủy.');
        }

        if (orderDetail.status === ORDER_DETAIL_STATUS.PENDING) {
            throw new Error('Yêu cầu hủy cho sản phẩm này đang được xử lý.');
        }

        await OrderCancellationRequest.create({
            orderId,
            orderDetailId: detailId,
            userId,
            reason,
            status: 'PENDING'
        }, { transaction: t });

        await orderDetail.update({ status: ORDER_DETAIL_STATUS.PENDING }, { transaction: t });

        await t.commit();
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const getAdminOrders = async () => {
  return Order.findAll({
    include: [
      { model: User, as: 'customer', attributes: ['id', 'fullName', 'email'] },
      { model: OrderDetail, as: 'details', include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }] }
    ],
    order: [['createdAt', 'DESC']]
  });
};
  
const getAdminOrderById = async (orderId) => {
  const order = await Order.findOne({
    where: { id: orderId },
    include: [
      { model: User, as: 'customer' },
      { model: OrderDetail, as: 'details', include: [{ model: Product, as: 'product' }] }
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
    requestCancelOrderItem,
    getAdminOrders,
    getAdminOrderById,
    updateOrderStatus,
    handleCancelRequest
};
