import express from 'express';
import productFeatureController from '../controllers/productFeature.controller.js';
import { authorize, verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/api/products/:id/insights', verifyToken, authorize('user', 'admin'), productFeatureController.getProductInsights);
router.get('/api/products/:id/similar', productFeatureController.getSimilarProducts);

router.post('/api/products/:id/reviews', verifyToken, authorize('user', 'admin'), productFeatureController.submitReview);
router.post('/api/products/:id/favorite', verifyToken, authorize('user', 'admin'), productFeatureController.toggleFavorite);
router.post('/api/products/:id/viewed', verifyToken, authorize('user', 'admin'), productFeatureController.addViewedProduct);

router.get('/api/user/wishlist', verifyToken, authorize('user', 'admin'), productFeatureController.getWishlist);
router.get('/api/user/coupons', verifyToken, authorize('user', 'admin'), productFeatureController.getUserCoupons);
router.post('/api/checkout/discount/preview', verifyToken, authorize('user', 'admin'), productFeatureController.previewDiscount);

export default router;