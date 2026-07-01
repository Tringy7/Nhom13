import { Router } from "express";
import { verifyToken, authorize } from "../middleware/auth.middleware.js";
import * as adminCtrl from "../controllers/admin.controller.js";

const router = Router();

const guard = [verifyToken, authorize("admin")];

// ── Dashboard ────────────────────────────────────────────────────────────────
router.get("/dashboard", ...guard, adminCtrl.getDashboard);

// ── Users ────────────────────────────────────────────────────────────────────
router.get("/users",              ...guard, adminCtrl.getUsers);
router.get("/users/:id",          ...guard, adminCtrl.getUserById);
router.patch("/users/:id/role",   ...guard, adminCtrl.changeUserRole);
router.patch("/users/:id/lock",   ...guard, adminCtrl.lockUser);
router.patch("/users/:id/unlock", ...guard, adminCtrl.unlockUser);

// ── Managers ─────────────────────────────────────────────────────────────────
router.post("/managers",                       ...guard, adminCtrl.createManager);
router.get("/managers",                        ...guard, adminCtrl.getManagers);
router.put("/managers/:id",                    ...guard, adminCtrl.updateManager);
router.patch("/managers/:id/lock",             ...guard, adminCtrl.lockManager);
router.patch("/managers/:id/unlock",           ...guard, adminCtrl.unlockManager);
router.patch("/managers/:id/reset-password",   ...guard, adminCtrl.resetManagerPassword);

// ── Shippers ─────────────────────────────────────────────────────────────────
router.post("/shippers",              ...guard, adminCtrl.createShipper);
router.get("/shippers",               ...guard, adminCtrl.getShippers);
router.put("/shippers/:id",           ...guard, adminCtrl.updateShipper);
router.patch("/shippers/:id/lock",    ...guard, adminCtrl.lockShipper);
router.patch("/shippers/:id/unlock",  ...guard, adminCtrl.unlockShipper);

// ── Orders ───────────────────────────────────────────────────────────────────
router.get("/orders",     ...guard, adminCtrl.getOrders);
router.get("/orders/:id", ...guard, adminCtrl.getOrderById);

// ── Cancel Requests ───────────────────────────────────────────────────────────
router.get("/cancel-requests",                ...guard, adminCtrl.getCancelRequests);
router.patch("/cancel-requests/:id/approve",  ...guard, adminCtrl.approveCancelRequest);
router.patch("/cancel-requests/:id/reject",   ...guard, adminCtrl.rejectCancelRequest);

// ── Order Detail Return Requests ───────────────────────────────────────────
router.get("/order-detail-return-requests",                ...guard, adminCtrl.getOrderDetailReturnRequests);
router.patch("/order-detail-return-requests/:id/approve",  ...guard, adminCtrl.approveOrderDetailReturnRequest);
router.patch("/order-detail-return-requests/:id/reject",   ...guard, adminCtrl.rejectOrderDetailReturnRequest);

// ── Revenue ───────────────────────────────────────────────────────────────────
router.get("/reports/revenue", ...guard, adminCtrl.getRevenueReport);

// ── System Settings ──────────────────────────────────────────────────────────
router.get("/settings", ...guard, adminCtrl.getSystemSettings);
router.put("/settings", ...guard, adminCtrl.updateSystemSettings);

export default router;