'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(entities) {
      User.hasMany(entities.Order, { foreignKey: 'userId', as: 'orders' });
      User.hasMany(entities.Order, { foreignKey: 'shipperId', as: 'deliveries' });
      User.hasOne(entities.Cart, { foreignKey: 'userId', as: 'cart' });
      User.hasMany(entities.Wishlist, { foreignKey: 'userId', as: 'wishlistItems' });
      User.hasMany(entities.Review, { foreignKey: 'userId', as: 'reviews' });
      User.hasMany(entities.ProductReview, { foreignKey: 'userId', as: 'productReviews' });
      User.hasMany(entities.OrderCancellationRequest, { foreignKey: 'userId', as: 'cancellationRequests' });

      // Defines the many-to-many relationship with Voucher through UserVoucher
      User.belongsToMany(entities.Voucher, { through: entities.UserVoucher, foreignKey: 'userId', as: 'vouchers' });
    }
  }
  User.init({
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
      allowNull: true
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'shipper', 'user'),
      allowNull: false,
      defaultValue: 'user'
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'LOCKED'),
      allowNull: false,
      defaultValue: 'ACTIVE'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
  });
  return User;
};
