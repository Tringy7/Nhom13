import db from '../../models/index.js';
import productFeatureService from '../product/productFeature.service.js';

const { Order, OrderItem, OrderStatusHistory, Payment, Cart, CartItem, Product, User } = db;

const ORDER_STATUS = {
  NEW: 'new',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  CANCEL_REQUEST: 'cancel_request'
};

const isCancelableWithin30Minutes = (order) => {
  const createdAt = new Date(order.createdAt);
  const now = new Date();
  const diffMinutes = (now - createdAt) / 1000 / 60;
  return diffMinutes <= 30;
};

const createStatusHistory = async (orderId, status, note, changedBy, transaction = null) => {
  const options = transaction ? { transaction } : {};
  return OrderStatusHistory.create({
    orderId,
    status,
    note,
    changedBy
  }, options);
};

const transitionOrderStatus = async (order, nextStatus, { changedBy = null, note = null, transaction = null } = {}) => {
  const updateData = { status: nextStatus };

  if (nextStatus === ORDER_STATUS.CONFIRMED && !order.confirmedAt) {
    updateData.confirmedAt = new Date();
  }

  if (nextStatus === ORDER_STATUS.CANCEL_REQUEST) {
    updateData.cancelRequestedAt = new Date();
  }

  const options = transaction ? { transaction } : {};
  await order.update(updateData, options);

  const defaultNotes = {
    [ORDER_STATUS.CONFIRMED]: 'Đơn hàng đã được xác nhận',
    [ORDER_STATUS.PREPARING]: 'Shop đang chuẩn bị hàng',
    [ORDER_STATUS.SHIPPING]: 'Đơn hàng đang giao',
    [ORDER_STATUS.DELIVERED]: 'Đơn hàng giao thành công',
    [ORDER_STATUS.CANCELLED]: 'Đơn hàng đã bị hủy',
    [ORDER_STATUS.CANCEL_REQUEST]: 'Người dùng gửi yêu cầu hủy đơn'
  };

  await createStatusHistory(
    order.id,
    nextStatus,
    note || defaultNotes[nextStatus] || `Cập nhật trạng thái sang ${nextStatus}`,
    changedBy,
    transaction
  );

  return order;
};

const createOrder = async (userId, { shippingAddress, phoneNumber, note, paymentMethod = 'COD', items, couponCode = null, pointsToUse = 0 }) => {
  const cart = await Cart.findOne({
    where: { userId },
    include: [{
      model: CartItem,
      as: 'items',
      include: [{ model: Product, as: 'product' }]
    }]
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new Error('Giỏ hàng trống');
  }

  let selectedCartItems = cart.items;
  if (items && items.length > 0) {
    const selectedProductIds = items.map(item => item.productId);
    selectedCartItems = cart.items.filter(cartItem => selectedProductIds.includes(cartItem.productId));
  }

  if (selectedCartItems.length === 0) {
    throw new Error('Không có sản phẩm nào được chọn để thanh toán');
  }

  for (const item of selectedCartItems) {
    if (!item.product) throw new Error('Sản phẩm không tồn tại');
    if (item.product.stock < item.quantity) {
      throw new Error(`Sản phẩm "${item.product.name}" không đủ số lượng trong kho`);
    }
  }

  const subtotal = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const discountPreview = await productFeatureService.previewDiscount(userId, {
    subtotal,
    couponCode,
    pointsToUse
  });

  const result = await db.sequelize.transaction(async (t) => {
    const order = await Order.create({
      userId,
      totalPrice: discountPreview.finalTotal,
      originalTotalPrice: discountPreview.originalTotal,
      discountAmount: discountPreview.discountAmount,
      couponCode: discountPreview.couponCode,
      pointsRedeemed: discountPreview.pointsRedeemed,
      shippingAddress,
      phoneNumber,
      note,
      status: ORDER_STATUS.NEW
    }, { transaction: t });

    const orderItems = selectedCartItems.map(item => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }));
    await OrderItem.bulkCreate(orderItems, { transaction: t });

    await Payment.create({
      orderId: order.id,
      method: paymentMethod,
      status: 'pending',
      amount: discountPreview.finalTotal
    }, { transaction: t });

    await createStatusHistory(order.id, ORDER_STATUS.NEW, 'Đơn hàng mới được tạo', userId, t);

    await productFeatureService.consumeCouponIfNeeded(discountPreview.couponCode, t);
    await productFeatureService.consumePoints(userId, discountPreview.pointsRedeemed, t);

    const cartItemIdsToRemove = selectedCartItems.map(item => item.id);
    await CartItem.destroy({
      where: {
        cartId: cart.id,
        id: cartItemIdsToRemove
      },
      transaction: t
    });

    return order;
  });

  if (result && result.id) {
    const AUTO_CONFIRM_DELAY = 30 * 60 * 1000;

    setTimeout(async () => {
      try {
        const orderToUpdate = await Order.findByPk(result.id);

        if (orderToUpdate && orderToUpdate.status === ORDER_STATUS.NEW) {
          await transitionOrderStatus(orderToUpdate, ORDER_STATUS.CONFIRMED, {
            changedBy: null,
            note: 'Hệ thống tự động xác nhận sau 30 phút.'
          });
        }
      } catch (error) {
        console.error(`[Auto-Confirm] Lỗi khi tự động xác nhận đơn hàng #${result.id}:`, error);
      }
    }, AUTO_CONFIRM_DELAY);
  }

  return result;
};

const getOrders = async (userId) => {
  return Order.findAll({
    where: { userId },
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'thumbnail'] }]
      },
      {
        model: Payment,
        as: 'payment',
        attributes: ['method', 'status', 'amount', 'paidAt']
      },
      {
        model: OrderStatusHistory,
        as: 'statusHistory',
        include: [{ model: User, as: 'changedByUser', attributes: ['id', 'firstName', 'lastName', 'email'] }]
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

const getOrderById = async (userId, orderId) => {
  const order = await Order.findOne({
    where: { id: orderId, userId },
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'thumbnail', 'price'] }]
      },
      {
        model: Payment,
        as: 'payment'
      },
      {
        model: OrderStatusHistory,
        as: 'statusHistory',
        include: [{ model: User, as: 'changedByUser', attributes: ['id', 'firstName', 'lastName', 'email'] }],
        order: [['createdAt', 'ASC']]
      }
    ]
  });

  if (!order) throw new Error('Không tìm thấy đơn hàng');
  return order;
};

const cancelOrder = async (userId, orderId) => {
  const order = await Order.findOne({ where: { id: orderId, userId } });
  if (!order) throw new Error('Không tìm thấy đơn hàng');

  if (order.status === ORDER_STATUS.PREPARING) {
    if (!isCancelableWithin30Minutes(order)) {
      throw new Error('Đã quá 30 phút, không thể gửi yêu cầu hủy đơn');
    }

    await transitionOrderStatus(order, ORDER_STATUS.CANCEL_REQUEST, {
      changedBy: userId,
      note: 'Người dùng gửi yêu cầu hủy đơn cho shop'
    });

    return { message: 'Đã gửi yêu cầu hủy đơn, chờ shop xác nhận' };
  }

  if (![ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED].includes(order.status)) {
    throw new Error('Không thể hủy đơn hàng ở trạng thái này');
  }

  if (!isCancelableWithin30Minutes(order)) {
    throw new Error('Đã quá 30 phút, không thể hủy đơn hàng');
  }

  await transitionOrderStatus(order, ORDER_STATUS.CANCELLED, {
    changedBy: userId,
    note: 'Người dùng hủy đơn hàng'
  });

  return { message: 'Hủy đơn hàng thành công' };
};

const getAdminOrders = async () => {
  return Order.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
      },
      {
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'thumbnail'] }]
      },
      {
        model: Payment,
        as: 'payment',
        attributes: ['method', 'status', 'amount', 'paidAt']
      },
      {
        model: OrderStatusHistory,
        as: 'statusHistory',
        include: [{ model: User, as: 'changedByUser', attributes: ['id', 'firstName', 'lastName', 'email'] }]
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

const getAdminOrderById = async (orderId) => {
  const order = await Order.findOne({
    where: { id: orderId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'address']
      },
      {
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'thumbnail', 'price'] }]
      },
      {
        model: Payment,
        as: 'payment'
      },
      {
        model: OrderStatusHistory,
        as: 'statusHistory',
        include: [{ model: User, as: 'changedByUser', attributes: ['id', 'firstName', 'lastName', 'email'] }],
        order: [['createdAt', 'ASC']]
      }
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
    [ORDER_STATUS.PREPARING]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCEL_REQUEST],
    [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED],
    [ORDER_STATUS.CANCEL_REQUEST]: [ORDER_STATUS.CANCELLED, ORDER_STATUS.PREPARING]
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

const handleCancelRequest = async (adminId, orderId, approve = true) => {
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error('Không tìm thấy đơn hàng');

  if (order.status !== ORDER_STATUS.CANCEL_REQUEST) {
    throw new Error('Đơn hàng không ở trạng thái yêu cầu hủy');
  }

  if (approve) {
    return transitionOrderStatus(order, ORDER_STATUS.CANCELLED, {
      changedBy: adminId,
      note: 'Shop đã duyệt yêu cầu hủy đơn'
    });
  }

  return transitionOrderStatus(order, ORDER_STATUS.PREPARING, {
    changedBy: adminId,
    note: 'Shop từ chối yêu cầu hủy đơn, đơn hàng tiếp tục xử lý'
  });
};

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