import express from 'express';
import productFeatureController from '../controllers/productFeature.controller.js';
import { authorize, verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes for getting product-related information
router.get('/api/products/:id/insights', productFeatureController.getProductInsights);
router.get('/api/products/:id/similar', productFeatureController.getSimilarProducts);

// Routes requiring user authentication
router.post('/api/products/:id/reviews', verifyToken, authorize('user', 'admin'), productFeatureController.submitReview);
router.post('/api/products/:id/favorite', verifyToken, authorize('user', 'admin'), productFeatureController.toggleFavorite);
router.get('/api/user/wishlist', verifyToken, authorize('user', 'admin'), productFeatureController.getWishlist);

// Removed routes related to ProductView, Coupon, and discount previews as the features were simplified
// - POST /api/products/:id/viewed
// - GET /api/user/coupons
// - POST /api/checkout/discount/preview

export default router;