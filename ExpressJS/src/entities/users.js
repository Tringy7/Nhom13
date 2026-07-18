'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(entities) {
      User.hasMany(entities.Order, { foreignKey: 'userId', as: 'orders' });
      User.hasMany(entities.Order, { foreignKey: 'shipperId', as: 'deliveries' });
      User.hasOne(entities.Cart, { foreignKey: 'userId', as: 'cart' });
      User.hasMany(entities.Wishlist, { foreignKey: 'userId', as: 'wishlistItems' });
      User.hasMany(entities.ProductReview, { foreignKey: 'userId', as: 'reviews' });
      User.hasMany(entities.OrderCancellationRequest, { foreignKey: 'userId', as: 'cancellationRequests' });
      User.belongsToMany(entities.Voucher, { through: entities.UserVoucher, foreignKey: 'userId', as: 'vouchers' });
    }
  }
  User.init({
    fullName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(11),
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
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    refreshTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true
  });
  return User;
};