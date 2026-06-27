import db from '../../entities/index.js';

const {
  Product,
  Brand,
  ProductReview,
  Wishlist,
  Order,
  OrderDetail,
  User,
  ProductImage
} = db;

const { Op } = db.Sequelize;

const ensureOrderDeliveredForProduct = async (userId, orderId, productId) => {
  const order = await Order.findOne({
    where: { id: orderId, userId, orderStatus: 'DELIVERED' },
    include: [{ model: OrderDetail, as: 'details', where: { productId }, required: true }]
  });
  if (!order) {
    throw new Error('Bạn chỉ có thể đánh giá sản phẩm đã mua và đã giao thành công');
  }
  return order;
};

const submitReview = async (userId, productId, { orderId, rating, comment = '' }) => {
  const { ProductReview, User, Coupon } = db;
  if (!rating || rating < 1 || rating > 5) {
    throw new Error('Điểm đánh giá phải từ 1 đến 5');
  }
  await ensureOrderDeliveredForProduct(userId, orderId, productId);

  const existed = await ProductReview.findOne({
    where: { userId, productId, orderId }
  });
  if (existed) {
    throw new Error('Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi');
  }

  const review = await ProductReview.create({
    userId,
    productId,
    orderId,
    rating,
    comment
  });
  return { review };
};

const toggleFavorite = async (userId, productId) => {
  const existed = await Wishlist.findOne({ where: { userId, productId } });
  if (existed) {
    await existed.destroy();
    return { favorite: false };
  }
  await Wishlist.create({ userId, productId });
  return { favorite: true };
};

const getWishlist = async (userId) => {
  const wishlistItems = await Wishlist.findAll({
    where: { userId },
    include: [{
      model: Product,
      as: 'product',
      attributes: ['id', 'name', 'price', 'thumbnail', 'stock', 'isActive'],
      include: [{ model: Brand, as: 'brand', attributes: ['id', 'name'] }]
    }],
    order: [['createdAt', 'DESC']]
  });
  return wishlistItems.map((item) => item.product).filter(Boolean);
};

const addViewedProduct = async (userId, productId) => {
  const { ProductView, Product, ProductImage, Brand } = db;
  await ProductView.create({ userId, productId, viewedAt: new Date() });

  const recent = await ProductView.findAll({
    where: { userId },
    include: [{
      model: Product,
      as: 'product',
      attributes: ['id', 'name', 'price', 'thumbnail', 'sold'],
      include: [
        { model: ProductImage, as: 'images', attributes: ['id', 'imageUrl'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name'] }
      ]
    }],
    order: [['viewedAt', 'DESC']],
    limit: 12
  });

  const unique = [];
  const seen = new Set();
  for (const item of recent) {
    if (item.product && !seen.has(item.product.id)) {
      seen.add(item.product.id);
      unique.push(item.product);
    }
  }

  return unique;
};

const getReviewsByProduct = async (productId) => {
  const { ProductReview, User } = db;
  const reviews = await ProductReview.findAll({
    where: { productId },
    include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'avatar'] }],
    order: [['createdAt', 'DESC']],
    limit: 30
  });

  const reviewCount = reviews.length;
  const avgRating = reviewCount ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount : 0;

  return {
    avgRating: avgRating.toFixed(1),
    reviewCount,
    reviews
  };
};

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

const getSimilarProducts = async (productId, limit = 4) => {
    const product = await Product.findByPk(productId);
    if (!product) return [];

    const whereClause = {
        id: { [Op.ne]: product.id },
        [Op.or]: [
            { brandId: product.brandId }
        ]
    };

    if (product.category) {
        whereClause[Op.or].push(
            db.sequelize.where(
                db.sequelize.fn('LOWER', db.sequelize.col('category')),
                '=',
                product.category.toLowerCase()
            )
        );
    }

    const products = await Product.findAll({
        where: whereClause,
        limit,
        order: [['sold', 'DESC']],
        include: [
            {
                model: Brand,
                as: 'brand',
                attributes: ['id', 'name']
            },
            {
                model: ProductImage,
                as: 'images',
                attributes: ['imageUrl']
            }
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
};
