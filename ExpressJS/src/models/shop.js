'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shop extends Model {
    static associate(models) {
      Shop.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'owner'
      });
      Shop.hasMany(models.Product, {
        foreignKey: 'shopId',
        as: 'products'
      });
      Shop.hasMany(models.Order, {
        foreignKey: 'shopId',
        as: 'orders'
      });
      Shop.hasMany(models.Promotion, {
        foreignKey: 'shopId',
        as: 'promotions'
      });
      Shop.hasOne(models.VendorWallet, {
        foreignKey: 'shopId',
        as: 'wallet'
      });
    }
  }
  Shop.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACTIVE', 'REJECTED', 'LOCKED'),
      allowNull: false,
      defaultValue: 'PENDING'
    }
  }, {
    sequelize,
    modelName: 'Shop',
    tableName: 'shops'
  });
  return Shop;
};