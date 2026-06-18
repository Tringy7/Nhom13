'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Promotion extends Model {
    static associate(entities) {
      Promotion.belongsToMany(entities.Product, {
        through: entities.PromotionProduct,
        foreignKey: 'promotionId',
        otherKey: 'productId',
        as: 'products'
      });
    }
  }
  Promotion.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    discountPercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Promotion',
    tableName: 'promotions'
  });
  return Promotion;
};