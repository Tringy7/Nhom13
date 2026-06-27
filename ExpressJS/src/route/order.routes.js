import express from 'express';
import orderController from '../controllers/order.controller.js';
import {authorize, verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  '/api/order/add',
  verifyToken,
  authorize("user", "manager", "admin"),
  orderController.createOrder
);

router.post(
  '/api/orders/:orderId/items/:itemId',
  verifyToken,
  authorize("user", "manager", "admin"),
  orderController.cancelOrderItem
);

router.delete(
  '/api/order/:orderId/cancel',
  verifyToken,
  authorize("user", "manager", "admin"),
  orderController.cancelOrder
);

router.post(
  '/api/order/:orderId/cancel-request',
  verifyToken,
  authorize("user", "manager", "admin"),
  orderController.requestCancelOrder
);

router.get(
  '/api/orders',
  verifyToken,
  authorize("user", "manager", "admin"),
  orderController.getOrders);

router.get(
  '/api/orders/:orderId',
  verifyToken,
  authorize("user", "manager", "admin"),
  orderController.getOrderById);

router.post(
  '/api/orders/:orderId/feedback',
  verifyToken,
  authorize("user", "manager", "admin"),
  orderController.submitOrderFeedback
);

router.post(
  '/api/orders/:orderId/shipper-feedback',
  verifyToken,
  authorize("user", "manager", "admin"),
  orderController.submitShipperFeedback
);

router.get(
  '/api/admin/orders',
  verifyToken,
  authorize('admin'),
  orderController.getAdminOrders
);

router.get(
  '/api/admin/orders/:orderId',
  verifyToken,
  authorize('admin'),
  orderController.getAdminOrderById
);

router.patch(
  '/api/admin/orders/:orderId/status',
  verifyToken,
  authorize('admin'),
  orderController.updateOrderStatus
);

router.patch(
  '/api/admin/orders/:orderId/cancel-request',
  verifyToken,
  authorize('admin'),
  orderController.handleCancelRequest
);

// ── Shipper Routes ──────────────────────────────────────────────────
router.get(
  '/api/shipper/orders',
  verifyToken,
  authorize('shipper', 'admin', 'manager'),
  orderController.getShipperOrders
);

router.patch(
  '/api/shipper/orders/:orderId/accept',
  verifyToken,
  authorize('shipper', 'admin', 'manager'),
  orderController.acceptOrder
);

router.patch(
  '/api/shipper/orders/:orderId/delivered',
  verifyToken,
  authorize('shipper', 'admin', 'manager'),
  orderController.markDelivered
);

router.patch(
  '/api/shipper/orders/:orderId/failed',
  verifyToken,
  authorize('shipper', 'admin', 'manager'),
  orderController.markDeliveryFailed
);

router.get(
  '/api/shipper/stats',
  verifyToken,
  authorize('shipper', 'admin', 'manager'),
  orderController.getShipperStats
);

export default router;