import orderService from '../services/order/order.service.js';
import { PAYMENT_METHOD } from '../constants/payment.constants.js';
import { sendOrderSuccessEmail } from '../services/auth/email.service.js';

const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id ?? req.user?.userId;
    const { fullName, phoneNumber, shippingAddress, note, paymentMethod, items, voucherId, pointsToUse } = req.body;

    if (!items || items.length === 0) {
      throw new Error('Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng');
    }

    const order = await orderService.createOrder(userId, {
      fullName,
      phoneNumber,
      shippingAddress,
      note,
      paymentMethod,
      items,
      voucherId,
      pointsToUse
    }, req);

    if (paymentMethod === PAYMENT_METHOD.VNPAY && order.paymentUrl) {
      return res.status(200).json({
        success: true,
        message: 'Đơn hàng đã được tạo, đang chuyển hướng đến VNPAY...',
        data: {
          ...order,
          paymentUrl: order.paymentUrl
        }
      });
    }

    if (req.user?.email) {
      sendOrderSuccessEmail(req.user.email, order).catch((error) => {
        console.error('Gửi email xác nhận đơn hàng thất bại:', error);
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: order
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.user?.id ?? req.user?.userId;
    const orders = await orderService.getOrders(userId);

    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const userId = req.user?.id ?? req.user?.userId;
    const { orderId } = req.params;
    const order = await orderService.getOrderById(userId, orderId);
    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const cancelOrderItem = async (req, res) => {
  try {
    const userId = req.user?.id ?? req.user?.userId;
    const { orderId, itemId } = req.params;
    const updatedOrder = await orderService.cancelOrderItem(userId, orderId, parseInt(itemId, 10));
    return res.status(200).json({
      success: true,
      message: 'Hủy sản phẩm thành công.',
      data: updatedOrder
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const requestReturnOrderItem = async (req, res) => {
  try {
    const userId = req.user?.id ?? req.user?.userId;
    const { orderId, itemId } = req.params;
    const { reason } = req.body;
    const result = await orderService.requestReturnOrderItem(userId, orderId, parseInt(itemId, 10), reason);
    return res.status(200).json({
      success: true,
      message: 'Gửi yêu cầu trả hàng thành công.',
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user?.id ?? req.user?.userId;
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do hủy đơn hàng.' });
    }

    const result = await orderService.cancelOrder(userId, orderId, String(reason).trim());

    return res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công.'
    });
  } catch (error) {
    console.error('[cancelOrder] Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const requestCancelOrder = async (req, res) => {
  try {
    const userId = req.user?.id ?? req.user?.userId;
    const { orderId } = req.params;
    const { reason } = req.body;

    const result = await orderService.requestCancelOrder(userId, orderId, reason || 'Người dùng yêu cầu hủy đơn hàng.');

    return res.status(200).json({
      success: true,
      message: 'Gửi yêu cầu hủy đơn hàng thành công, vui lòng chờ Shop phản hồi.',
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const requestReturnOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { orderId } = req.params;
    const { reason } = req.body;
    const result = await orderService.requestReturnOrder(userId, orderId, reason);
    return res.status(200).json({ success: true, message: 'Gửi yêu cầu trả hàng thành công.', data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAdminOrders = async (req, res) => {
  try {
    const orders = await orderService.getAdminOrders();

    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getAdminOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getAdminOrderById(orderId);

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { orderId } = req.params;
    const { status, note } = req.body;

    const order = await orderService.updateOrderStatus(adminId, orderId, status, note);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const handleCancelRequest = async (req, res) => {
  try {
    const adminId = req.user.id ?? req.user.userId;
    const { orderId } = req.params;
    const { approve = true, adminNotes = '' } = req.body;

    const result = await orderService.handleCancelRequest(adminId, orderId, { approve, adminNotes });

    return res.status(200).json({
      success: true,
      message: approve ? 'Đã duyệt yêu cầu hủy đơn' : 'Đã từ chối yêu cầu hủy đơn',
      data: result
    });
  } catch (error) {
    console.error('[handleCancelRequest] Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// ── Shipper Controllers ──────────────────────────────────────────────
const getShipperOrders = async (req, res) => {
  try {
    const shipperId = req.user?.id;
    const orders = await orderService.getShipperOrders(shipperId);
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const shipperId = req.user?.id;
    const { orderId } = req.params;
    const order = await orderService.acceptOrder(shipperId, orderId);
    return res.status(200).json({ success: true, message: 'Đã nhận đơn, bắt đầu giao hàng!', data: order });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const markDelivered = async (req, res) => {
  try {
    const shipperId = req.user?.id;
    const { orderId } = req.params;
    const order = await orderService.markDelivered(shipperId, orderId);
    return res.status(200).json({ success: true, message: 'Giao hàng thành công!', data: order });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const markDeliveryFailed = async (req, res) => {
  try {
    const shipperId = req.user?.id;
    const orderId = Number(req.params.orderId);
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do giao thất bại.' });
    }
    const order = await orderService.markDeliveryFailed(shipperId, orderId, reason);
    return res.status(200).json({ success: true, message: 'Đã ghi nhận giao hàng thất bại.', data: order });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getShipperStats = async (req, res) => {
  try {
    const shipperId = req.user?.id;
    const stats = await orderService.getShipperStats(shipperId);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const submitOrderFeedback = async (req, res) => {
  try {
    const userId = req.user?.id ?? req.user?.userId;
    const { orderId } = req.params;
    const { rating, comment } = req.body;
    const feedback = await orderService.submitOrderFeedback(userId, orderId, { rating, comment });
    return res.status(201).json({ success: true, message: 'Đánh giá đơn hàng thành công!', data: feedback });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const submitShipperFeedback = async (req, res) => {
  try {
    const userId = req.user?.id ?? req.user?.userId;
    const { orderId } = req.params;
    const { rating, comment, tags } = req.body;
    const feedback = await orderService.submitShipperFeedback(userId, orderId, { rating, comment, tags });
    return res.status(201).json({ success: true, message: 'Đánh giá shipper thành công!', data: feedback });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export default {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrderItem,
  requestReturnOrderItem,
  cancelOrder,
  requestCancelOrder,
  requestReturnOrder,
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
  getShipperStats
};