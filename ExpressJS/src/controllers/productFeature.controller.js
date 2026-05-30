import productFeatureService from '../services/product/productFeature.service.js';

const submitReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.id);
    const { orderId, rating, comment } = req.body;

    const data = await productFeatureService.submitReview(userId, productId, {
      orderId,
      rating,
      comment
    });

    return res.status(201).json({
      success: true,
      message: 'Đánh giá sản phẩm thành công',
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.id);

    const data = await productFeatureService.toggleFavorite(userId, productId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const addViewedProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.id);

    const data = await productFeatureService.addViewedProduct(userId, productId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await productFeatureService.getWishlist(userId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getSimilarProducts = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const data = await productFeatureService.getSimilarProducts(productId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getProductInsights = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const userId = req.user?.id || null;

    const data = await productFeatureService.getProductInsights(productId, userId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getUserCoupons = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await productFeatureService.getUserCoupons(userId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const previewDiscount = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await productFeatureService.previewDiscount(userId, req.body || {});
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export default {
  submitReview,
  toggleFavorite,
  addViewedProduct,
  getWishlist,
  getSimilarProducts,
  getProductInsights,
  getUserCoupons,
  previewDiscount
};