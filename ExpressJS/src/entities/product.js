'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(entities) {
      // Product.belongsTo(entities.Category, { foreignKey: 'categoryId', as: 'category' }); // Removed
      Product.belongsTo(entities.Brand, { foreignKey: 'brandId', as: 'brand' });
      Product.hasMany(entities.CartItem, { foreignKey: 'productId', as: 'cartItems' });
      Product.hasMany(entities.OrderDetail, { foreignKey: 'productId', as: 'orderDetails' });
      Product.hasMany(entities.ProductReview, { foreignKey: 'productId', as: 'reviews' });
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
    sold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ram: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    images: {
      type: DataTypes.VIRTUAL,
      get() {
        const thumbnail = this.getDataValue('thumbnail');
        return thumbnail ? [thumbnail] : [];
      }
    },
    status: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('isActive') === false ? 'INACTIVE' : 'ACTIVE';
      }
    },
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
    tableName: 'products'
  });
  return Product;
};
