import axios from '../axios.customize';

// Tạo đơn hàng (Checkout)
export const createOrder = (data) => {
    const URL_API = '/api/order/add';
    return axios.post(URL_API, data);
};

// Lấy danh sách đơn hàng của user
export const getOrders = () => {
    const URL_API = '/api/orders';
    return axios.get(URL_API);
};

// Lấy chi tiết 1 đơn hàng
export const getOrderById = (orderId) => {
    const URL_API = `/api/orders/${orderId}`;
    return axios.get(URL_API);
};

// Huỷ đơn hàng trực tiếp (trong vòng 30p & đơn mới)
export const cancelOrderApi = (orderId, reason) => {
    const URL_API = `/api/order/${orderId}/cancel`;
    return axios.delete(URL_API, { data: { reason } });
};

// Gửi yêu cầu hủy đơn hàng cho shop
export const requestCancelOrderApi = (orderId, reason) => {
    const URL_API = `/api/order/${orderId}/cancel-request`;
    return axios.post(URL_API, { reason });
};

// Gửi yêu cầu trả hàng cho toàn bộ đơn hàng
export const requestReturnOrder = (orderId, reason) => {
    const URL_API = `/api/order/${orderId}/return-request`;
    return axios.post(URL_API, { reason });
};

// Gửi yêu cầu trả hàng cho một sản phẩm
export const requestReturnOrderItemApi = (orderId, itemId, reason) => {
    const URL_API = `/api/orders/${orderId}/items/${itemId}/return-request`;
    return axios.post(URL_API, { reason });
};

// Gửi đánh giá hệ thống
export const submitOrderFeedbackApi = (orderId, data) => {
    const URL_API = `/api/orders/${orderId}/feedback`;
    return axios.post(URL_API, data);
};

// Gửi đánh giá shipper
export const submitShipperFeedbackApi = (orderId, data) => {
    const URL_API = `/api/orders/${orderId}/shipper-feedback`;
    return axios.post(URL_API, data);
};

// Hủy một item trong đơn hàng
export const cancelOrderItemApi = (orderId, itemId) => {
    const URL_API = `/api/orders/${orderId}/items/${itemId}`;
    return axios.post(URL_API);
};

export const getAdminOrders = () => {
    const URL_API = '/api/admin/orders';
    return axios.get(URL_API);
};

export const getAdminOrderById = (orderId) => {
    const URL_API = `/api/admin/orders/${orderId}`;
    return axios.get(URL_API);
};

export const updateAdminOrderStatus = (orderId, status, note) => {
    const URL_API = `/api/admin/orders/${orderId}/status`;
    return axios.patch(URL_API, { status, note });
};

export const handleAdminCancelRequest = (orderId, approve = true) => {
    const URL_API = `/api/admin/orders/${orderId}/cancel-request`;
    return axios.patch(URL_API, { approve });
};