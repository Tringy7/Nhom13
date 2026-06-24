import db from '../../entities/index.js';

const { Op } = db.Sequelize || {};

const normalizeDecimal = (value) => Number(value || 0);

const getRewardForReview = () => {
  const roll = Math.random();
  if (roll < 0.5) {
    return {
      type: 'points',
      value: 50
    };
  }

  const code = `RVW${Date.now().toString().slice(-6)}`;
  return {
    type: 'coupon',
    value: 10,
    token: code
  };
};

const ensureOrderDeliveredForProduct = async (userId, orderId, productId) => {
  const { Order, OrderItem } = db;
  const order = await Order.findOne({
    where: {
      id: orderId,
      userId,
      status: 'delivered'
    },
    include: [
      {
        model: OrderItem,
        as: 'items',
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

const submitReview = async (userId, productId, { orderId, rating, comment = '' }) => {
  const { ProductReview, User, Coupon } = db;
  if (!rating || rating < 1 || rating > 5) {
    throw new Error('Điểm đánh giá phải từ 1 đến 5');
  }

  await ensureOrderDeliveredForProduct(userId, orderId, productId);

  const existed = await ProductReview.findOne({
    where: {
      userId,
      productId,
      orderId
    }
  });

  if (existed) {
    throw new Error('Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi');
  }

  const reward = getRewardForReview();

  return db.sequelize.transaction(async (t) => {
    const review = await ProductReview.create({
      userId,
      productId,
      orderId,
      rating,
      comment,
      rewardType: reward.type,
      rewardValue: reward.value,
      rewardToken: reward.token || null
    }, { transaction: t });

    if (reward.type === 'points') {
      const user = await User.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
      const newBalance = Number(user.pointsBalance || 0) + Number(reward.value || 0);
      await user.update({ pointsBalance: newBalance }, { transaction: t });
    }

    if (reward.type === 'coupon') {
      await Coupon.create({
        code: reward.token,
        title: 'Ưu đãi đánh giá sản phẩm',
        description: 'Mã giảm giá nhận từ đánh giá sản phẩm đã mua',
        discountType: 'percent',
        discountValue: reward.value,
        minOrderAmount: 0,
        maxDiscount: 200000,
        usageLimit: 1,
        usedCount: 0,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        userId
      }, { transaction: t });
    }

    return {
      review,
      reward
    };
  });
};

const toggleFavorite = async (userId, productId) => {
  const { ProductFavorite } = db;
  const existed = await ProductFavorite.findOne({ where: { userId, productId } });
  if (existed) {
    await existed.destroy();
    return { favorite: false };
  }

  await ProductFavorite.create({ userId, productId });
  return { favorite: true };
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

const getWishlist = async (userId) => {
  const { ProductFavorite, Product, ProductImage, Brand } = db;
  const rows = await ProductFavorite.findAll({
    where: { userId },
    include: [{
      model: Product,
      as: 'product',
      attributes: ['id', 'name', 'price', 'thumbnail', 'sold', 'stock', 'category'],
      include: [
        { model: ProductImage, as: 'images', attributes: ['id', 'imageUrl'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name'] }
      ]
    }],
    order: [['createdAt', 'DESC']]
  });

  return rows.map((row) => row.product).filter(Boolean);
};

const getSimilarProducts = async (productId, limit = 8) => {
  const { Product, ProductImage, Brand } = db;
  const { Op: SequelizeOp } = db.Sequelize;
  const product = await Product.findByPk(productId);
  if (!product) return [];

  const products = await Product.findAll({
    where: {
      id: { [SequelizeOp.ne]: product.id },
      [SequelizeOp.or]: [
        { category: product.category },
        { brandId: product.brandId }
      ]
    },
    limit,
    order: [['sold', 'DESC']],
    include: [
      { model: ProductImage, as: 'images', attributes: ['id', 'imageUrl'] },
      { model: Brand, as: 'brand', attributes: ['id', 'name'] }
    ]
  });

  return products;
};

const getReviewsByProduct = async (productId) => {
  const { ProductReview, User } = db;
  const reviews = await ProductReview.findAll({
    where: { productId },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'fullName', 'avatar']
    }],
    order: [['createdAt', 'DESC']],
    limit: 30
  });

  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount
    : 0;

  return {
    avgRating,
    reviewCount,
    reviews
  };
};

const getProductInsights = async (productId, userId = null) => {
  const { ProductFavorite, OrderItem, Order, ProductReview } = db;
  const [reviewData, favoriteCount, buyerCount, commentCount, favoriteRow] = await Promise.all([
    getReviewsByProduct(productId),
    ProductFavorite.count({ where: { productId } }),
    OrderItem.count({
      where: { productId },
      include: [{ model: Order, as: 'order', where: { status: 'delivered' }, required: true }],
      distinct: true,
      col: 'orderId'
    }),
    ProductReview.count({ where: { productId } }),
    userId ? ProductFavorite.findOne({ where: { userId, productId } }) : null
  ]);

  return {
    avgRating: reviewData.avgRating,
    reviewCount: reviewData.reviewCount,
    favoriteCount,
    buyerCount,
    commentCount,
    isFavorite: Boolean(favoriteRow),
    reviews: reviewData.reviews
  };
};

const getUserCoupons = async (userId) => {
  const { Coupon } = db;
  const { Op: SequelizeOp } = db.Sequelize;
  const now = new Date();
  return Coupon.findAll({
    where: {
      userId,
      isActive: true,
      [SequelizeOp.or]: [
        { expiresAt: null },
        { expiresAt: { [SequelizeOp.gt]: now } }
      ]
    },
    order: [['createdAt', 'DESC']]
  });
};

const previewDiscount = async (userId, { subtotal = 0, couponCode = null, pointsToUse = 0 }) => {
  const { User, Coupon } = db;
  const { Op: SequelizeOp } = db.Sequelize;
  const user = await User.findByPk(userId);
  if (!user) throw new Error('Người dùng không tồn tại');

  const rawSubtotal = normalizeDecimal(subtotal);
  let discountAmount = 0;
  let couponApplied = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ where: { code: couponCode, isActive: true, userId } });
    if (!coupon) throw new Error('Mã giảm giá không hợp lệ');

    if (coupon.expiresAt && new Date(coupon.expiresAt) <= new Date()) {
      throw new Error('Mã giảm giá đã hết hạn');
    }

    if (coupon.usageLimit && Number(coupon.usedCount || 0) >= Number(coupon.usageLimit)) {
      throw new Error('Mã giảm giá đã hết lượt sử dụng');
    }

    if (rawSubtotal < normalizeDecimal(coupon.minOrderAmount)) {
      throw new Error('Đơn hàng chưa đạt mức tối thiểu để áp mã giảm giá');
    }

    if (coupon.discountType === 'percent') {
      discountAmount = (rawSubtotal * normalizeDecimal(coupon.discountValue)) / 100;
    } else {
      discountAmount = normalizeDecimal(coupon.discountValue);
    }

    if (coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, normalizeDecimal(coupon.maxDiscount));
    }

    couponApplied = coupon;
  }

  let pointsRedeemed = Math.max(0, Number(pointsToUse || 0));
  pointsRedeemed = Math.min(pointsRedeemed, Number(user.pointsBalance || 0));

  const pointsDiscount = pointsRedeemed * 1000;
  const totalDiscount = Math.min(rawSubtotal, discountAmount + pointsDiscount);
  const finalTotal = Math.max(0, rawSubtotal - totalDiscount);

  return {
    originalTotal: rawSubtotal,
    discountAmount: totalDiscount,
    finalTotal,
    pointsRedeemed,
    pointsDiscount,
    couponCode: couponApplied?.code || null,
    couponDiscount: discountAmount
  };
};

const consumeCouponIfNeeded = async (couponCode, transaction) => {
  const { Coupon } = db;
  if (!couponCode) return;
  const coupon = await Coupon.findOne({ where: { code: couponCode }, transaction, lock: transaction.LOCK.UPDATE });
  if (!coupon) return;

  await coupon.update({
    usedCount: Number(coupon.usedCount || 0) + 1,
    isActive: coupon.usageLimit ? Number(coupon.usedCount || 0) + 1 < Number(coupon.usageLimit) : coupon.isActive
  }, { transaction });
};

const consumePoints = async (userId, pointsRedeemed, transaction) => {
  const { User } = db;
  if (!pointsRedeemed) return;
  const user = await User.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
  if (!user) return;

  const nextBalance = Math.max(0, Number(user.pointsBalance || 0) - Number(pointsRedeemed || 0));
  await user.update({ pointsBalance: nextBalance }, { transaction });
};

export default {
  submitReview,
  toggleFavorite,
  addViewedProduct,
  getWishlist,
  getSimilarProducts,
  getReviewsByProduct,
  getProductInsights,
  getUserCoupons,
  previewDiscount,
  consumeCouponIfNeeded,
  consumePoints
};