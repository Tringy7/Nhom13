import express from "express";
import managerController from "../../controllers/Manager/manager.controller.js";
import { verifyToken, authorize } from "../../middleware/auth.middleware.js";
import { uploadProductImage } from "../../middleware/upload.middleware.js";

const router = express.Router();

// Middleware for handling product image uploads
const productUploads = uploadProductImage.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);

// Apply verifyToken and authorize('MANAGER', 'ADMIN') to all manager routes
router.use("/api/manager", verifyToken, authorize("manager", "admin"));

// route.get("/api/manager/dashboard", managerController.getDashboard)
// Sales Summary & Reports
router.get("/api/manager/reports/sales-summary", managerController.getSalesReport);

// Products Management
router.get("/api/manager/products", managerController.getProducts);
router.get("/api/manager/products/:id", managerController.getProductDetail);
router.post("/api/manager/products", productUploads, managerController.createProduct);
router.put("/api/manager/products/:id", productUploads, managerController.updateProduct);
router.delete("/api/manager/products/:id", managerController.deleteProduct);
router.patch("/api/manager/products/:id/toggle", managerController.toggleProductActive);

// Brands & Categories
router.get("/api/manager/brands", managerController.getBrands);
router.post("/api/manager/brands", managerController.createBrand);
router.put("/api/manager/brands/:id", managerController.updateBrand);
router.delete("/api/manager/brands/:id", managerController.deleteBrand);
router.get("/api/manager/categories", managerController.getCategories);
router.post("/api/manager/categories", managerController.createCategory);
router.put("/api/manager/categories/:oldName", managerController.updateCategory);
router.delete("/api/manager/categories/:name", managerController.deleteCategory);

// Order Fulfillment
router.get("/api/manager/orders", managerController.getOrders);
router.get("/api/manager/orders/:id", managerController.getOrderById);
router.patch("/api/manager/orders/:id/status", managerController.updateOrderStatus);
router.patch("/api/manager/orders/:id/assign-shipper", managerController.assignShipper);
router.get("/api/manager/shippers", managerController.getShippers);

// Vouchers Management
router.get("/api/manager/vouchers", managerController.getVouchers);
router.post("/api/manager/vouchers", managerController.createVoucher);
router.put("/api/manager/vouchers/:id", managerController.updateVoucher);
router.delete("/api/manager/vouchers/:id", managerController.deleteVoucher);

// Promotions Management
router.get("/api/manager/promotions", managerController.getPromotions);
router.post("/api/manager/promotions", managerController.createPromotion);
router.put("/api/manager/promotions/:id", managerController.updatePromotion);
router.delete("/api/manager/promotions/:id", managerController.deletePromotion);

// Cancellations
router.get("/api/manager/cancellation-requests", managerController.getCancellationRequests);
router.patch("/api/manager/cancellation-requests/:id", managerController.processCancellationRequest);

// Order Detail Returns
router.get("/api/manager/order-detail-return-requests", managerController.getOrderDetailReturnRequests);
router.patch("/api/manager/order-detail-return-requests/:id", managerController.processOrderDetailReturnRequest);

// Chat History
router.get("/api/manager/chat/history", managerController.getChatHistory);
router.get("/api/manager/chat/history/:conversationId", managerController.getChatDetail);

export default router;