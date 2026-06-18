'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(entities) {
      Product.belongsTo(entities.Brand, {
        foreignKey: 'brandId',
        as: 'brand'
      });
      Product.hasMany(entities.ProductImage, {
        foreignKey: 'productId',
        as: 'images'
      });
      Product.belongsToMany(entities.Promotion, {
        through: entities.PromotionProduct,
        foreignKey: 'productId',
        otherKey: 'promotionId',
        as: 'promotions'
      });
      Product.hasMany(entities.ProductReview, {
        foreignKey: 'productId',
        as: 'reviews'
      });
      Product.hasMany(entities.ProductFavorite, {
        foreignKey: 'productId',
        as: 'favorites'
      });
      Product.hasMany(entities.ProductView, {
        foreignKey: 'productId',
        as: 'views'
      });
    }
  }
  Product.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    sold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ram:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    brandId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'brands',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products'
  });
  return Product;
};