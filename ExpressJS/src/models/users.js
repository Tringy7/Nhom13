'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Order, {
        foreignKey: 'userId',
        as: 'orders'
      });
      User.hasMany(models.ProductReview, {
        foreignKey: 'userId',
        as: 'reviews'
      });
      User.hasMany(models.ProductFavorite, {
        foreignKey: 'userId',
        as: 'favorites'
      });
      User.hasMany(models.ProductView, {
        foreignKey: 'userId',
        as: 'viewedProducts'
      });
      User.hasMany(models.Coupon, {
        foreignKey: 'userId',
        as: 'coupons'
      });
    }
  }
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    refreshToken: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    address: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    gender: DataTypes.STRING,
    image: DataTypes.STRING,
    positionId: DataTypes.STRING,
    pointsBalance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};