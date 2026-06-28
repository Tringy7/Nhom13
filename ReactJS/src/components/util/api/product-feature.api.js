import axios from '../axios.customize';

export const getProductInsightsApi = (productId) => axios.get(`/api/products/${productId}/insights`);
export const getSimilarProductsApi = (productId) => axios.get(`/api/products/${productId}/similar`);
export const submitReviewApi = (productId, payload) => axios.post(`/api/products/${productId}/reviews`, payload);
export const claimReviewRewardApi = (reviewId) => axios.post(`/api/reviews/${reviewId}/claim-reward`);
export const toggleFavoriteApi = (productId) => axios.post(`/api/products/${productId}/favorite`);
export const addViewedProductApi = (productId) => axios.post(`/api/products/${productId}/viewed`);
export const getWishlistApi = () => axios.get('/api/user/wishlist');
export const getUserCouponsApi = () => axios.get('/api/user/coupons');
export const previewDiscountApi = (payload) => axios.post('/api/checkout/discount/preview', payload);