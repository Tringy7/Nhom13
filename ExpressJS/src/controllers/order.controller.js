import orderService from '../services/order/order.service.js';

const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id ?? req.user?.userId;
    const { shippingAddress, phoneNumber, note, paymentMethod, items, couponCode, pointsToUse } = req.body;

    if (!items || items.length === 0) {
      throw new Error('Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng');
    }

    const order = await orderService.createOrder(userId, {
      shippingAddress,
      phoneNumber,
      note,
      paymentMethod,
      items,
      couponCode,
      pointsToUse
    });

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

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user?.id ?? req.user?.userId;
    const { orderId } = req.params;

    const result = await orderService.cancelOrder(userId, orderId);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
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
    const adminId = req.user.id;
    const { orderId } = req.params;
    const { approve = true } = req.body;

    const order = await orderService.handleCancelRequest(adminId, orderId, approve);

    return res.status(200).json({
      success: true,
      message: approve ? 'Đã duyệt yêu cầu hủy đơn' : 'Đã từ chối yêu cầu hủy đơn',
      data: order
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
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