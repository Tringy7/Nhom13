import * as adminService from "../services/admin/admin.service.js";

const ok  = (res, data, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data });

const err = (res, e, status = 400) =>
  res.status(status).json({ success: false, message: e.message });

// Dashboard
export const getDashboard         = async (req, res) => { try { ok(res, await adminService.getDashboardStats()); } catch(e) { err(res, e); } };

// Users
export const getUsers             = async (req, res) => { try { ok(res, await adminService.getUsers(req.query)); } catch(e) { err(res, e); } };
export const getUserById          = async (req, res) => { try { ok(res, await adminService.getUserById(req.params.id)); } catch(e) { err(res, e); } };
export const changeUserRole       = async (req, res) => { try { ok(res, await adminService.changeUserRole(req.params.id, req.body.role, req.user.id), "Role updated"); } catch(e) { err(res, e); } };
export const lockUser             = async (req, res) => { try { await adminService.lockUser(req.params.id);   ok(res, null, "User locked"); } catch(e) { err(res, e); } };
export const unlockUser           = async (req, res) => { try { await adminService.unlockUser(req.params.id); ok(res, null, "User unlocked"); } catch(e) { err(res, e); } };

// Managers
export const createManager        = async (req, res) => { try { ok(res, await adminService.createManager(req.body), "Manager created", 201); } catch(e) { err(res, e); } };
export const getManagers          = async (req, res) => { try { ok(res, await adminService.getManagers(req.query)); } catch(e) { err(res, e); } };
export const updateManager        = async (req, res) => { try { ok(res, await adminService.updateManager(req.params.id, req.body), "Manager updated"); } catch(e) { err(res, e); } };
export const lockManager          = async (req, res) => { try { await adminService.lockManager(req.params.id);   ok(res, null, "Manager locked"); } catch(e) { err(res, e); } };
export const unlockManager        = async (req, res) => { try { await adminService.unlockManager(req.params.id); ok(res, null, "Manager unlocked"); } catch(e) { err(res, e); } };
export const resetManagerPassword = async (req, res) => { try { ok(res, await adminService.resetManagerPassword(req.params.id), "Password reset"); } catch(e) { err(res, e); } };

// Shippers
export const createShipper        = async (req, res) => { try { ok(res, await adminService.createShipper(req.body), "Shipper created", 201); } catch(e) { err(res, e); } };
export const getShippers          = async (req, res) => { try { ok(res, await adminService.getShippers(req.query)); } catch(e) { err(res, e); } };
export const updateShipper        = async (req, res) => { try { ok(res, await adminService.updateShipper(req.params.id, req.body), "Shipper updated"); } catch(e) { err(res, e); } };
export const lockShipper          = async (req, res) => { try { await adminService.lockShipper(req.params.id);   ok(res, null, "Shipper locked"); } catch(e) { err(res, e); } };
export const unlockShipper        = async (req, res) => { try { await adminService.unlockShipper(req.params.id); ok(res, null, "Shipper unlocked"); } catch(e) { err(res, e); } };

// Orders
export const getOrders            = async (req, res) => { try { ok(res, await adminService.getOrders(req.query)); } catch(e) { err(res, e); } };
export const getOrderById         = async (req, res) => { try { ok(res, await adminService.getOrderById(req.params.id)); } catch(e) { err(res, e); } };

// Cancel Requests
export const getCancelRequests    = async (req, res) => { try { ok(res, await adminService.getCancelRequests(req.query)); } catch(e) { err(res, e); } };
export const approveCancelRequest = async (req, res) => { try { await adminService.approveCancelRequest(req.params.id, req.user.id); ok(res, null, "Approved"); } catch(e) { err(res, e); } };
export const rejectCancelRequest  = async (req, res) => { try { await adminService.rejectCancelRequest(req.params.id, req.user.id, req.body.adminNotes); ok(res, null, "Rejected"); } catch(e) { err(res, e); } };

// Return Requests
export const getReturnRequests    = async (req, res) => { try { ok(res, await adminService.getReturnRequests(req.query)); } catch(e) { err(res, e); } };
export const approveReturnRequest = async (req, res) => { try { await adminService.approveReturnRequest(req.params.id, req.user.id); ok(res, null, "Approved"); } catch(e) { err(res, e); } };
export const rejectReturnRequest  = async (req, res) => { try { await adminService.rejectReturnRequest(req.params.id, req.user.id, req.body.adminNotes); ok(res, null, "Rejected"); } catch(e) { err(res, e); } };

// Order Detail Return Requests
export const getOrderDetailReturnRequests = async (req, res) => { try { ok(res, await adminService.getOrderDetailReturnRequests(req.query)); } catch(e) { err(res, e); } };
export const approveOrderDetailReturnRequest = async (req, res) => { try { await adminService.approveOrderDetailReturnRequest(req.params.id, req.user.id); ok(res, null, "Approved"); } catch(e) { err(res, e); } };
export const rejectOrderDetailReturnRequest = async (req, res) => { try { await adminService.rejectOrderDetailReturnRequest(req.params.id, req.user.id, req.body.adminNotes); ok(res, null, "Rejected"); } catch(e) { err(res, e); } };

// Revenue
export const getRevenueReport     = async (req, res) => { try { ok(res, await adminService.getRevenueReport()); } catch(e) { err(res, e); } };

// System Settings
export const getSystemSettings    = async (req, res) => { try { ok(res, await adminService.getSystemSettings()); } catch(e) { err(res, e); } };
export const updateSystemSettings = async (req, res) => { try { ok(res, await adminService.updateSystemSettings(req.body), "Settings updated"); } catch(e) { err(res, e); } };