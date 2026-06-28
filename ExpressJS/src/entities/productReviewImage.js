'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ProductReviewImage extends Model {
    static associate(models) {
      ProductReviewImage.belongsTo(models.ProductReview, { foreignKey: 'productReviewId', as: 'review' });
    }
  }
  ProductReviewImage.init({
    productReviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'product_reviews',
        key: 'id'
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ProductReviewImage',
    tableName: 'product_review_images',
    timestamps: true
  });
  return ProductReviewImage;
};