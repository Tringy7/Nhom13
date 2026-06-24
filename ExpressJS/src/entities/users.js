'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(entities) {
      User.hasMany(entities.Order, { foreignKey: 'userId', as: 'orders' });
      User.hasMany(entities.Order, { foreignKey: 'shipperId', as: 'deliveries' });
      User.hasOne(entities.Cart, { foreignKey: 'userId', as: 'cart' });
      User.hasMany(entities.Wishlist, { foreignKey: 'userId', as: 'wishlistItems' });
      User.hasMany(entities.Review, { foreignKey: 'userId', as: 'reviews' });
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
    role: {
      type: DataTypes.ENUM('ADMIN', 'MANAGER', 'SHIPPER', 'USER'),
      allowNull: false,
      defaultValue: 'USER'
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'LOCKED'),
      allowNull: false,
      defaultValue: 'ACTIVE'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users'
  });
  return User;
};