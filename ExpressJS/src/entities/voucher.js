'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Voucher extends Model {
    static associate(entities) {
      Voucher.hasMany(entities.Order, { foreignKey: 'voucherId', as: 'orders' });

      // Defines the many-to-many relationship with User through UserVoucher
      Voucher.belongsToMany(entities.User, { through: entities.UserVoucher, foreignKey: 'voucherId', as: 'users' });
    }
  }
  Voucher.init({
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    discountType: {
      type: DataTypes.ENUM('PERCENT', 'FIXED'),
      allowNull: false
    },
    discountValue: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    minOrderValue: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Voucher',
    tableName: 'Vouchers'
  });
  return Voucher;
};