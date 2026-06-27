import axios from '../axios.customize';

export const getShipperOrdersApi = () => axios.get('/api/shipper/orders');
export const acceptOrderApi = (orderId) => axios.patch(`/api/shipper/orders/${orderId}/accept`);
export const markDeliveredApi = (orderId) => axios.patch(`/api/shipper/orders/${orderId}/delivered`);
export const markDeliveryFailedApi = (orderId, reason) => axios.patch(`/api/shipper/orders/${orderId}/failed`, { reason });
export const getShipperStatsApi = () => axios.get('/api/shipper/stats');
