import axios from '../axios.customize';

// Reports
export const getSalesReportApi = () => axios.get('/api/manager/reports/sales-summary');

// Products
export const getProductsApi = (params) => axios.get('/api/manager/products', { params });
export const getProductDetailApi = (id) => axios.get(`/api/manager/products/${id}`);
export const createProductApi = (formData) => axios.post('/api/manager/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateProductApi = (id, formData) => axios.put(`/api/manager/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteProductApi = (id) => axios.delete(`/api/manager/products/${id}`);
export const toggleProductActiveApi = (id) => axios.patch(`/api/manager/products/${id}/toggle`);

// Brands & Categories
export const getBrandsApi = () => axios.get('/api/manager/brands');
export const createBrandApi = (data) => axios.post('/api/manager/brands', data);
export const updateBrandApi = (id, data) => axios.put(`/api/manager/brands/${id}`, data);
export const deleteBrandApi = (id) => axios.delete(`/api/manager/brands/${id}`);
export const getCategoriesApi = () => axios.get('/api/manager/categories');
export const createCategoryApi = (data) => axios.post('/api/manager/categories', data);
export const updateCategoryApi = (oldName, data) => axios.put(`/api/manager/categories/${oldName}`, data);
export const deleteCategoryApi = (name) => axios.delete(`/api/manager/categories/${name}`);

// Orders
export const getOrdersApi = (params) => axios.get('/api/manager/orders', { params });
export const getOrderByIdApi = (id) => axios.get(`/api/manager/orders/${id}`);
export const updateOrderStatusApi = (id, status, notes) => axios.patch(`/api/manager/orders/${id}/status`, { status, notes });
export const assignShipperApi = (id, shipperId, shipperFee) => axios.patch(`/api/manager/orders/${id}/assign-shipper`, { shipperId, shipperFee });
export const getShippersApi = () => axios.get('/api/manager/shippers');

// Vouchers
export const getVouchersApi = () => axios.get('/api/manager/vouchers');
export const createVoucherApi = (data) => axios.post('/api/manager/vouchers', data);
export const updateVoucherApi = (id, data) => axios.put(`/api/manager/vouchers/${id}`, data);
export const deleteVoucherApi = (id) => axios.delete(`/api/manager/vouchers/${id}`);

// Promotions
export const getPromotionsApi = () => axios.get('/api/manager/promotions');
export const createPromotionApi = (data) => axios.post('/api/manager/promotions', data);
export const updatePromotionApi = (id, data) => axios.put(`/api/manager/promotions/${id}`, data);
export const deletePromotionApi = (id) => axios.delete(`/api/manager/promotions/${id}`);

// Cancellations
export const getCancellationRequestsApi = () => axios.get('/api/manager/cancellation-requests');
export const processCancellationRequestApi = (id, status, adminNotes) => axios.patch(`/api/manager/cancellation-requests/${id}`, { status, adminNotes });

// Chat History
export const getChatHistoryApi = (params) => axios.get('/api/manager/chat/history', { params });
export const getChatDetailApi = (conversationId) => axios.get(`/api/manager/chat/history/${conversationId}`);
