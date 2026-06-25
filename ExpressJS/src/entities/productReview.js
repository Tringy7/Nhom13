'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductReview extends Model {
    static associate(entities) {
      ProductReview.belongsTo(entities.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      ProductReview.belongsTo(entities.Product, {
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }

  ProductReview.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rewardType: {
      type: DataTypes.ENUM('points', 'coupon'),
      allowNull: false,
      defaultValue: 'points'
    },
    rewardValue: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rewardToken: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ProductReview',
    tableName: 'product_reviews'
  });

  return ProductReview;
};
