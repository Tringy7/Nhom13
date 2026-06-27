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
    Review,
    ProductReview,
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

        const shippingFee = 30000;
        const finalTotalWithCorrection = Math.max(0, subtotal + shippingFee - voucherDiscount - pointsDiscount);

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
            shippingFee,
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
            await userVoucher.update({ isUsed: true }, { transaction: t });
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
            const userVoucher = await UserVoucher.findOne({ where: { userId, voucherId: order.voucherId, isUsed: true }, transaction: t });
            if (userVoucher) {
                await userVoucher.update({ isUsed: false }, { transaction: t });
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

const autoConfirmOldOrders = async () => {
    try {
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        await Order.update(
            { orderStatus: ORDER_STATUS.CONFIRMED },
            { where: { orderStatus: ORDER_STATUS.NEW, createdAt: { [Op.lte]: thirtyMinsAgo } } }
        );
    } catch (err) {
        console.error('Auto confirm error:', err);
    }
};

const getOrders = async (userId) => {
    await autoConfirmOldOrders();
    const { Order, OrderDetail, Product, Payment } = db;
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
    await autoConfirmOldOrders();
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
            { model: User, as: 'shipper', attributes: ['fullName', 'phone'] },
            { model: OrderCancellationRequest, as: 'cancellationRequest' },
            { model: Voucher, as: 'voucher' }
        ]
    });

    if (!order) throw new Error('Không tìm thấy đơn hàng');

    // Lấy feedback hệ thống và shipper cho đơn hàng này
    const feedbacks = await Review.findAll({
        where: {
            targetId: orderId,
            targetType: ['ORDER', 'SHOP']
        }
    });

    // Lấy đánh giá sản phẩm của đơn hàng này
    const productReviews = await ProductReview.findAll({
        where: {
            orderId,
            userId
        }
    });

    const orderData = order.toJSON();
    orderData.feedbacks = feedbacks || [];
    orderData.productReviews = productReviews || [];

    return orderData;
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

    if (order.orderStatus !== ORDER_STATUS.PREPARING) {
        throw new Error('Chỉ có thể gửi yêu cầu hủy đơn ở trạng thái Đang chuẩn bị hàng.');
    }
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

const cancelOrder = async (userId, orderId, reason) => {
    const t = await sequelize.transaction();
    try {
        const order = await Order.findOne({
            where: { id: orderId, userId },
            include: [{ model: OrderDetail, as: 'details' }],
            transaction: t
        });
        if (!order) throw new Error('Không tìm thấy đơn hàng');

        if (![ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED].includes(order.orderStatus)) {
            throw new Error('Chỉ được hủy trực tiếp ở trạng thái Đơn mới hoặc Đã xác nhận.');
        }

        // Lưu lý do hủy trực tiếp vào note của order
        const cancelNote = reason ? `Hủy đơn: ${reason}` : 'Người dùng hủy đơn trực tiếp';
        await order.update({ orderStatus: ORDER_STATUS.CANCELLED, note: cancelNote }, { transaction: t });

        // Tạo yêu cầu hủy với trạng thái APPROVED trực tiếp để manager và user có thể thấy lý do
        await OrderCancellationRequest.create({
            orderId: order.id,
            userId,
            reason: reason || 'Người dùng hủy đơn trực tiếp',
            status: 'APPROVED',
            processedAt: new Date()
        }, { transaction: t });

        for (const detail of order.details || []) {
            if (detail.status !== ORDER_DETAIL_STATUS.CANCELLED) {
                await detail.update({ status: ORDER_DETAIL_STATUS.CANCELLED }, { transaction: t });
                await Product.increment('stock', { by: detail.quantity, where: { id: detail.productId }, transaction: t });
            }
        }

        if (order.pointsDiscount > 0) {
            const user = await User.findByPk(userId, { transaction: t });
            if (user) {
                await user.increment('points', { by: Math.ceil(order.pointsDiscount), transaction: t });
                await createRewardHistory(userId, Math.ceil(order.pointsDiscount), REWARD_TYPE.EARN, `Hoàn điểm do hủy đơn hàng #${order.id}`, { transaction: t });
            }
        }

        if (order.voucherId) {
            const userVoucher = await UserVoucher.findOne({ where: { userId, voucherId: order.voucherId, isUsed: true }, transaction: t });
            if (userVoucher) {
                await userVoucher.update({ isUsed: false }, { transaction: t });
            }
        }

        await t.commit();
        return order;
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

// const handleCancelRequest = async (adminId, orderId, approve) => {
//     const { Order } = db;
//     const order = await Order.findByPk(orderId);
//     if (!order) throw new Error('Không tìm thấy đơn hàng');
//
//     await order.update({
//         orderStatus: status,
//         shipperId: shipperId || order.shipperId
//     });
//
//     return order;
// };

const handleCancelRequest = async (adminId, orderId, { approve, adminNotes = '' }) => {
    const t = await sequelize.transaction();
    try {
        const request = await OrderCancellationRequest.findOne({
            where: { orderId, status: 'PENDING' },
            include: [{
                model: Order,
                as: 'order',
                include: [{ model: OrderDetail, as: 'details' }]
            }],
            transaction: t
        });
        if (!request) throw new Error('Không tìm thấy yêu cầu hủy đang chờ duyệt.');

        if (request.status !== 'PENDING') {
            throw new Error('Yêu cầu này đã được xử lý.');
        }

        const order = request.order;
        const now = new Date();

        if (approve) {
            await request.update({
                status: 'APPROVED',
                approvedBy: adminId,
                adminNotes,
                processedAt: now
            }, { transaction: t });

            if (order) {
                await order.update({ orderStatus: ORDER_STATUS.CANCELLED, note: adminNotes || order.note }, { transaction: t });

                for (const detail of order.details || []) {
                    if (detail.status !== ORDER_DETAIL_STATUS.CANCELLED) {
                        await detail.update({ status: ORDER_DETAIL_STATUS.CANCELLED }, { transaction: t });
                        await Product.increment('stock', { by: detail.quantity, where: { id: detail.productId }, transaction: t });
                    }
                }

                if (order.pointsDiscount > 0) {
                    const user = await User.findByPk(order.userId, { transaction: t });
                    if (user) {
                        await user.increment('points', { by: Math.ceil(order.pointsDiscount), transaction: t });
                        await createRewardHistory(order.userId, Math.ceil(order.pointsDiscount), REWARD_TYPE.EARN, `Hoàn điểm do hủy đơn hàng #${order.id}`, { transaction: t });
                    }
                }
const handleCancelRequest = async (adminId, requestId, { approve, adminNotes = '' }) => {
    const request = await OrderCancellationRequest.findByPk(requestId, { include: [Order] });
    if (!request) throw new Error('Không tìm thấy yêu cầu hủy.');

                if (order.voucherId) {
                    const userVoucher = await UserVoucher.findOne({ where: { userId: order.userId, voucherId: order.voucherId, isUsed: true }, transaction: t });
                    if (userVoucher) {
                        await userVoucher.update({ isUsed: false }, { transaction: t });
                    }
                }
            }
        } else {
            await request.update({
                status: 'REJECTED',
                approvedBy: adminId,
                adminNotes,
                processedAt: now
            }, { transaction: t });

            if (order) {
                await order.update({ orderStatus: ORDER_STATUS.CONFIRMED }, { transaction: t });
            }
        }

        await t.commit();
        return request;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// ── Shipper Methods ──────────────────────────────────────────────────
// Lấy đơn hàng đang ở trạng thái CONFIRMED (chờ shipper nhận) và đơn của shipper này đang giao
async function getShipperOrders(shipperId) {
    const orders = await Order.findAll({
        where: {
            [Op.or]: [
                { orderStatus: ORDER_STATUS.CONFIRMED },
                {
                    shipperId,
                    orderStatus: [ORDER_STATUS.SHIPPING, ORDER_STATUS.DELIVERED, ORDER_STATUS.DELIVERY_FAILED]
                }
            ]
        },
        include: [
            {
                model: OrderDetail,
                as: 'details',
                include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'thumbnail', 'price'] }]
            },
            { model: Payment, as: 'payment' }
        ],
        order: [['createdAt', 'DESC']]
    });
    return orders;
}

// Shipper nhận đơn → SHIPPING (mặc định phí 30,000 VND)
async function acceptOrder(shipperId, orderId) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Không tìm thấy đơn hàng.');
    if (order.orderStatus !== ORDER_STATUS.CONFIRMED) {
        throw new Error('Đơn hàng không ở trạng thái có thể nhận.');
    }
    await order.update({ orderStatus: ORDER_STATUS.SHIPPING, shipperId, shipperFee: 30000 });
    return order;
}

// Shipper giao thành công → DELIVERED
async function markDelivered(shipperId, orderId) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Không tìm thấy đơn hàng.');
    if (order.orderStatus !== ORDER_STATUS.SHIPPING) {
        throw new Error('Đơn hàng chưa ở trạng thái đang giao.');
    }
    await order.update({ orderStatus: ORDER_STATUS.DELIVERED });
    if (order.payment) {
        await Payment.update({ status: 'PAID' }, { where: { orderId } });
    }
    return order;
}

// Shipper giao thất bại → DELIVERY_FAILED
async function markDeliveryFailed(shipperId, orderId, reason) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Không tìm thấy đơn hàng (id=' + orderId + ').');
    if (order.orderStatus !== ORDER_STATUS.SHIPPING) {
        throw new Error('Đơn hàng chưa ở trạng thái đang giao (trạng thái hiện tại: ' + order.orderStatus + ').');
    }
    if (order.shipperId && Number(order.shipperId) !== Number(shipperId)) {
        throw new Error('Bạn không phải shipper của đơn hàng này.');
    }
    await order.update({
        orderStatus: ORDER_STATUS.DELIVERY_FAILED,
        note: reason ? '[Giao thất bại] ' + reason : order.note
    });
    return order;
}

const submitOrderFeedback = async (userId, orderId, { rating, comment = '' }) => {
    if (!rating || rating < 1 || rating > 5) {
        throw new Error('Điểm đánh giá phải từ 1 đến 5');
    }
    const order = await Order.findOne({ where: { id: orderId, userId, orderStatus: 'DELIVERED' } });
    if (!order) {
        throw new Error('Đơn hàng không tồn tại hoặc chưa được giao thành công');
    }

    const existed = await Review.findOne({
        where: { userId, targetType: 'ORDER', targetId: orderId }
    });
    if (existed) {
        throw new Error('Bạn đã đánh giá trải nghiệm đơn hàng này rồi');
    }

    const feedback = await Review.create({
        userId,
        targetType: 'ORDER',
        targetId: orderId,
        rating,
        comment
    });
    return feedback;
};

const submitShipperFeedback = async (userId, orderId, { rating, comment = '', tags = [] }) => {
    if (!rating || rating < 1 || rating > 5) {
        throw new Error('Điểm đánh giá phải từ 1 đến 5');
    }
    const order = await Order.findOne({ 
        where: { id: orderId, userId, orderStatus: 'DELIVERED' } 
    });
    if (!order) {
        throw new Error('Đơn hàng không tồn tại hoặc chưa được giao thành công');
    }

    const existed = await Review.findOne({
        where: { userId, targetType: 'SHOP', targetId: orderId }
    });
    if (existed) {
        throw new Error('Bạn đã đánh giá shipper cho đơn hàng này rồi');
    }

    const tagsString = tags.length > 0 ? `[Tags: ${tags.join(', ')}] ` : '';
    const finalComment = `${tagsString}${comment}`;

    const feedback = await Review.create({
        userId,
        targetType: 'SHOP',
        targetId: orderId,
        rating,
        comment: finalComment
    });
    return feedback;
};

export default {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    cancelOrderItem,
    requestCancelOrder,
    getAdminOrders,
    getAdminOrderById,
    updateOrderStatus,
    handleCancelRequest,
    getShipperOrders,
    acceptOrder,
    markDelivered,
    markDeliveryFailed,
    submitOrderFeedback,
    submitShipperFeedback,
    requestCancelOrderItem,
    getShipperStats
};

async function getShipperStats(shipperId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const allOrders = await Order.findAll({
        where: { shipperId },
        attributes: ['id', 'orderStatus', 'shipperFee', 'totalAmount', 'createdAt', 'updatedAt'],
    });

    const delivered = allOrders.filter(o => o.orderStatus === 'DELIVERED');
    const failed = allOrders.filter(o => o.orderStatus === 'DELIVERY_FAILED');

    // Doanh thu shipper = shipperFee (phí vận chuyển shipper nhận), mặc định 30,000 nếu chưa có
    const getFee = (o) => Number(o.shipperFee || 30000);

    const totalRevenue = delivered.reduce((sum, o) => sum + getFee(o), 0);
    const monthlyRevenue = delivered
        .filter(o => new Date(o.updatedAt) >= startOfMonth)
        .reduce((sum, o) => sum + getFee(o), 0);
    const weeklyRevenue = delivered
        .filter(o => new Date(o.updatedAt) >= startOfWeek)
        .reduce((sum, o) => sum + getFee(o), 0);

    // Group by month for chart (last 6 months)
    const monthlyData = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = { month: key, orders: 0, revenue: 0 };
    }
    delivered.forEach(o => {
        const d = new Date(o.updatedAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[key]) {
            monthlyData[key].orders += 1;
            monthlyData[key].revenue += getFee(o);
        }
    });

    return {
        totalDelivered: delivered.length,
        totalFailed: failed.length,
        totalOrders: allOrders.length,
        successRate: allOrders.length > 0 ? ((delivered.length / allOrders.length) * 100).toFixed(1) : '0',
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue,
        monthlyChart: Object.values(monthlyData),
    };
};
