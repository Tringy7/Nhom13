'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PromotionProduct extends Model {
    static associate(entities) {
      // This table is used as a join table for Product <-> Promotion.
    }
  }
  PromotionProduct.init({
    promotionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'promotions',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'PromotionProduct',
    tableName: 'promotionproducts'
  });
  return PromotionProduct;
};