import axiosInstance from "../axios.customize";

const asAxiosResponse = (request) => request.then((data) => ({ data }));

// Dashboard
export const getDashboardStats = () =>
  asAxiosResponse(axiosInstance.get("/api/admin/dashboard"));

// Users
export const getAdminUsers = (params) =>
  asAxiosResponse(axiosInstance.get("/api/admin/users", { params }));
export const getAdminUserById = (id) =>
  asAxiosResponse(axiosInstance.get(`/api/admin/users/${id}`));
export const lockUser = (id) =>
  asAxiosResponse(axiosInstance.patch(`/api/admin/users/${id}/lock`));
export const unlockUser = (id) =>
  asAxiosResponse(axiosInstance.patch(`/api/admin/users/${id}/unlock`));
export const changeUserRole = (id, role) =>
  asAxiosResponse(axiosInstance.patch(`/api/admin/users/${id}/role`, { role }));

// Managers
export const createManager = (data) =>
  asAxiosResponse(axiosInstance.post("/api/admin/managers", data));
export const getAdminManagers = (params) =>
  asAxiosResponse(axiosInstance.get("/api/admin/managers", { params }));
export const updateManager = (id, data) =>
  asAxiosResponse(axiosInstance.put(`/api/admin/managers/${id}`, data));
export const lockManager = (id) =>
  asAxiosResponse(axiosInstance.patch(`/api/admin/managers/${id}/lock`));
export const unlockManager = (id) =>
  asAxiosResponse(axiosInstance.patch(`/api/admin/managers/${id}/unlock`));
export const resetManagerPassword = (id) =>
  asAxiosResponse(axiosInstance.patch(`/api/admin/managers/${id}/reset-password`));

// Shippers
export const createShipper = (data) =>
  asAxiosResponse(axiosInstance.post("/api/admin/shippers", data));
export const getAdminShippers = (params) =>
  asAxiosResponse(axiosInstance.get("/api/admin/shippers", { params }));
export const updateShipper = (id, data) =>
  asAxiosResponse(axiosInstance.put(`/api/admin/shippers/${id}`, data));
export const lockShipper = (id) =>
  asAxiosResponse(axiosInstance.patch(`/api/admin/shippers/${id}/lock`));
export const unlockShipper = (id) =>
  asAxiosResponse(axiosInstance.patch(`/api/admin/shippers/${id}/unlock`));

// Orders
export const getAdminOrders = (params) =>
  asAxiosResponse(axiosInstance.get("/api/admin/orders", { params }));
export const getAdminOrderById = (id) =>
  asAxiosResponse(axiosInstance.get(`/api/admin/orders/${id}`));

// Cancel Requests
export const getCancelRequests = (params) =>
  asAxiosResponse(axiosInstance.get("/api/admin/cancel-requests", { params }));
export const approveCancelRequest = (id) =>
  asAxiosResponse(axiosInstance.patch(`/api/admin/cancel-requests/${id}/approve`));
export const rejectCancelRequest = (id, data) =>
  asAxiosResponse(axiosInstance.patch(`/api/admin/cancel-requests/${id}/reject`, data));

// Return Requests (Whole Order)
export const getReturnRequests = (params) =>
    asAxiosResponse(axiosInstance.get("/api/admin/return-requests", { params }));
export const approveReturnRequest = (id) =>
    asAxiosResponse(axiosInstance.patch(`/api/admin/return-requests/${id}/approve`));
export const rejectReturnRequest = (id, data) =>
    asAxiosResponse(axiosInstance.patch(`/api/admin/return-requests/${id}/reject`, data));

// Order Detail Return Requests (Single Item)
export const getOrderDetailReturnRequests = (params) =>
    asAxiosResponse(axiosInstance.get("/api/admin/order-detail-return-requests", { params }));
export const approveOrderDetailReturnRequest = (id) =>
    asAxiosResponse(axiosInstance.patch(`/api/admin/order-detail-return-requests/${id}/approve`));
export const rejectOrderDetailReturnRequest = (id, data) =>
    asAxiosResponse(axiosInstance.patch(`/api/admin/order-detail-return-requests/${id}/reject`, data));

// Revenue
export const getRevenueReport = () =>
  asAxiosResponse(axiosInstance.get("/api/admin/reports/revenue"));

// System Settings
export const getSystemSettings = () =>
  asAxiosResponse(axiosInstance.get("/api/admin/settings"));
export const updateSystemSettings = (data) =>
  asAxiosResponse(axiosInstance.put("/api/admin/settings", data));