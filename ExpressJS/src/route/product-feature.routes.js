import express from 'express';
import productFeatureController from '../controllers/productFeature.controller.js';
import { authorize, verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes for getting product-related information
router.get('/api/products/:id/insights', productFeatureController.getProductInsights);
router.get('/api/products/:id/similar', productFeatureController.getSimilarProducts);

// Routes requiring user authentication
router.post('/api/products/:id/reviews', verifyToken, authorize('user', 'admin'), productFeatureController.submitReview);
router.post('/api/reviews/:id/claim-reward', verifyToken, authorize('user'), productFeatureController.claimReviewReward);
router.post('/api/products/:id/favorite', verifyToken, authorize('user', 'admin'), productFeatureController.toggleFavorite);
router.post('/api/products/:id/viewed', verifyToken, productFeatureController.addViewedProduct);
router.get('/api/user/wishlist', verifyToken, authorize('user', 'admin'), productFeatureController.getWishlist);

export default router;