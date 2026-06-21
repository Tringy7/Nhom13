import db from '../../entities/index.js';

const {
  Product,
  Brand,
  Review,      // Updated from ProductReview
  Wishlist,    // Updated from ProductFavorite
  Order,
  OrderDetail, // Updated from OrderItem
  User,
  Voucher      // Updated from Coupon
} = db;

const { Op } = db.Sequelize;

// Helper to ensure an order was delivered before allowing a review
const ensureOrderDeliveredForProduct = async (userId, orderId, productId) => {
  const order = await Order.findOne({
    where: {
      id: orderId,
      userId,
      orderStatus: 'DELIVERED' // Use the correct status from the Order model
    },
    include: [
      {
        model: OrderDetail,
        as: 'details', // Use the correct alias from the Order model association
        where: {
          productId
        },
        required: true
      }
    ]
  });

  if (!order) {
    throw new Error('Bạn chỉ có thể đánh giá sản phẩm đã mua và đã giao thành công');
  }

  return order;
};

// Simplified review submission
const submitReview = async (userId, productId, { orderId, rating, comment = '' }) => {
  if (!rating || rating < 1 || rating > 5) {
    throw new Error('Điểm đánh giá phải từ 1 đến 5');
  }

  await ensureOrderDeliveredForProduct(userId, orderId, productId);

  const existed = await Review.findOne({
    where: {
      userId,
      productId,
      orderId
    }
  });

  if (existed) {
    throw new Error('Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi');
  }

  const review = await Review.create({
    userId,
    productId,
    orderId,
    rating,
    comment
  });

  return { review };
};

// Updated favorite/wishlist toggle
const toggleFavorite = async (userId, productId) => {
  const existed = await Wishlist.findOne({ where: { userId, productId } });
  if (existed) {
    await existed.destroy();
    return { favorite: false };
  }

  await Wishlist.create({ userId, productId });
  return { favorite: true };
};

// Updated wishlist retrieval
const getWishlist = async (userId) => {
  const wishlistItems = await Wishlist.findAll({
    where: { userId },
    include: [{
      model: Product,
      as: 'product',
      attributes: ['id', 'name', 'price', 'images', 'stock', 'status'], // Use 'images' instead of 'thumbnail'
      include: [
        { model: Brand, as: 'brand', attributes: ['id', 'name'] }
      ]
    }],
    order: [['createdAt', 'DESC']]
  });

  return wishlistItems.map((item) => item.product).filter(Boolean);
};

// Updated review retrieval
const getReviewsByProduct = async (productId) => {
  const reviews = await Review.findAll({
    where: { productId },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'fullName', 'avatar'] // Use 'fullName' and 'avatar'
    }],
    order: [['createdAt', 'DESC']],
    limit: 30
  });

  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount
    : 0;

  return {
    avgRating: avgRating.toFixed(1),
    reviewCount,
    reviews
  };
};

// Simplified product insights
const getProductInsights = async (productId, userId = null) => {
  const [reviewData, favoriteCount, isFavorite] = await Promise.all([
    getReviewsByProduct(productId),
    Wishlist.count({ where: { productId } }),
    userId ? Wishlist.findOne({ where: { userId, productId } }) : null
  ]);

  return {
    avgRating: reviewData.avgRating,
    reviewCount: reviewData.reviewCount,
    favoriteCount,
    isFavorite: Boolean(isFavorite),
    reviews: reviewData.reviews
  };
};

// This function needs to be adapted based on how you want to handle similar products
const getSimilarProducts = async (productId, limit = 8) => {
    const product = await Product.findByPk(productId);
    if (!product) return [];

    const products = await Product.findAll({
        where: {
            id: { [Op.ne]: product.id },
            [Op.or]: [
                { categoryId: product.categoryId },
                { brandId: product.brandId }
            ]
        },
        limit,
        order: db.sequelize.random(), // A simple way to get varied similar products
        include: [
            { model: Brand, as: 'brand', attributes: ['id', 'name'] }
        ]
    });

    return products;
};


export default {
  submitReview,
  toggleFavorite,
  getWishlist,
  getReviewsByProduct,
  getProductInsights,
  getSimilarProducts
  // Removed functions related to ProductView, Coupon, and Points
};