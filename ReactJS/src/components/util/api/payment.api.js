import axios from '../axios.customize';

export const createVNPayPaymentApi = (orderData) => {
    return axios.post('/api/payment/create-vnpay', orderData);
};

export const getPaymentStatusApi = (orderId) => {
    return axios.get(`/api/payment/order/${orderId}/status`);
};

export const verifyPaymentApi = (params) => {
    return axios.get('/api/payment/verify-return', { params });
};
