'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(entities) {
      // Product.belongsTo(entities.Category, { foreignKey: 'categoryId', as: 'category' }); // Removed
      Product.belongsTo(entities.Brand, { foreignKey: 'brandId', as: 'brand' });
      Product.hasMany(entities.CartItem, { foreignKey: 'productId', as: 'cartItems' });
      Product.hasMany(entities.OrderDetail, { foreignKey: 'productId', as: 'orderDetails' });
      Product.hasMany(entities.Review, { foreignKey: 'productId', as: 'reviews' });
      Product.hasMany(entities.Wishlist, { foreignKey: 'productId', as: 'wishlistItems' });
    }
  }
  Product.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE'
    },
    // categoryId field removed
    brandId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Brands',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'Products'
  });
  return Product;
};