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

// Gửi yêu cầu hủy một item trong đơn hàng
export const requestCancelOrderItemApi = (orderId, itemId, data) => {
    const URL_API = `/api/orders/${orderId}/items/${itemId}/cancel-request`;
    return axios.post(URL_API, data);
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
