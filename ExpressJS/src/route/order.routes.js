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
 orderController.cancelOrder);

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
export default router;