import db from '../../entities/index.js';
import { createRewardHistory } from '../reward/reward.service.js';
import { REWARD_TYPE } from '../../constants/reward.constants.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const {
  Product,
  Brand,
  ProductReview,
  Wishlist,
  Order,
  OrderDetail,
  User,
  ProductImage,
  ProductReviewImage,
  sequelize
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

const submitReview = async (userId, productId, { orderId, rating, comment = '', images = [] }) => {
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
    comment,
    rewardType: 'POINTS',
    rewardValue: 100000,
  });

  if (images && images.length > 0) {
    const reviewImages = images.map(imageUrl => ({
      productReviewId: review.id,
      imageUrl
    }));
    await ProductReviewImage.bulkCreate(reviewImages);
  }

  return { review };
};

const updateReview = async (userId, reviewId, { rating, comment, existingImages = [], newImages = [] }) => {
    const t = await sequelize.transaction();
    try {
        const review = await ProductReview.findOne({
            where: { id: reviewId, userId },
            include: [{ model: ProductReviewImage, as: 'images' }],
            transaction: t
        });

        if (!review) {
            throw new Error('Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa.');
        }

        // Update rating and comment
        review.rating = rating;
        review.comment = comment;
        await review.save({ transaction: t });

        // Handle images
        const oldImageUrls = review.images.map(img => img.imageUrl);
        const keptImageUrls = Array.isArray(existingImages) ? existingImages : [existingImages].filter(Boolean);

        // Images to delete
        const imagesToDelete = oldImageUrls.filter(url => !keptImageUrls.includes(url));
        if (imagesToDelete.length > 0) {
            await ProductReviewImage.destroy({
                where: {
                    productReviewId: review.id,
                    imageUrl: { [Op.in]: imagesToDelete }
                },
                transaction: t
            });
            // Optionally delete files from server
            imagesToDelete.forEach(url => {
                const filePath = path.join(process.cwd(), 'src', url);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        // Images to add
        if (newImages.length > 0) {
            const imagesToAdd = newImages.map(imageUrl => ({
                productReviewId: review.id,
                imageUrl
            }));
            await ProductReviewImage.bulkCreate(imagesToAdd, { transaction: t });
        }

        await t.commit();
        return { success: true, message: 'Cập nhật đánh giá thành công.' };

    } catch (error) {
        if (t && !t.finished) {
            await t.rollback();
        }
        throw error;
    }
};

const claimReviewReward = async (userId, reviewId) => {
    const t = await sequelize.transaction();
    try {
        const review = await ProductReview.findOne({
            where: { id: reviewId, userId },
            transaction: t
        });

        if (!review) {
            throw new Error('Không tìm thấy đánh giá này.');
        }
        if (review.rewardToken) {
            throw new Error('Phần thưởng cho đánh giá này đã được nhận.');
        }

        const user = await User.findByPk(userId, { transaction: t });
        if (!user) {
            throw new Error('Người dùng không tồn tại.');
        }

        const rewardValue = review.rewardValue || 100000;
        const rewardToken = crypto.randomBytes(16).toString('hex');

        await user.increment('points', { by: rewardValue, transaction: t });
        await review.update({ rewardToken }, { transaction: t });

        await createRewardHistory(userId, rewardValue, REWARD_TYPE.EARN, `Nhận thưởng từ đánh giá sản phẩm #${review.productId}`, { transaction: t });

        await t.commit();

        return {
            success: true,
            message: `Bạn đã nhận được ${rewardValue.toLocaleString()} điểm thưởng!`,
            newBalance: user.points + rewardValue
        };
    } catch (error) {
        if (t && !t.finished) {
            await t.rollback();
        }
        throw error;
    }
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
  const reviews = await ProductReview.findAll({
    where: { productId },
    include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'avatar'] },
        { model: ProductReviewImage, as: 'images', attributes: ['imageUrl'] }
    ],
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
  updateReview,
  claimReviewReward,
  toggleFavorite,
  getWishlist,
  getReviewsByProduct,
  getProductInsights,
  getSimilarProducts
};