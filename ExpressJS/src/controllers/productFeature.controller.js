import productFeatureService from '../services/product/productFeature.service.js';

const submitReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.id);
    const { orderId, rating, comment } = req.body;
    const images = req.files ? req.files.map(file => `/uploads/reviews/${file.filename}`) : [];

    const data = await productFeatureService.submitReview(userId, productId, {
      orderId,
      rating,
      comment,
      images
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

const updateReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviewId = Number(req.params.id);
        const { rating, comment, existingImages } = req.body;
        const newImages = req.files ? req.files.map(file => `/uploads/reviews/${file.filename}`) : [];

        const data = await productFeatureService.updateReview(userId, reviewId, {
            rating,
            comment,
            existingImages: existingImages || [],
            newImages
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật đánh giá thành công',
            data
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const claimReviewReward = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviewId = Number(req.params.id);
        const data = await productFeatureService.claimReviewReward(userId, reviewId);
        return res.status(200).json({
            success: true,
            message: 'Nhận thưởng thành công!',
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

const addViewedProduct = async (req, res) => {
  try {
    const userId = req.user?.id;
    const productId = Number(req.params.id);
    if (userId) {
      await productFeatureService.addViewedProduct(userId, productId);
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(200).json({ success: true }); // silently ignore errors
  }
};

export default {
  submitReview,
  updateReview,
  claimReviewReward,
  toggleFavorite,
  getWishlist,
  getSimilarProducts,
  getProductInsights,
  addViewedProduct
};