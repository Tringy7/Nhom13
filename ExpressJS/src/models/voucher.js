'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Voucher extends Model {
    static associate(models) {
      Voucher.hasMany(models.UserVoucher, {
        foreignKey: 'voucherId',
        as: 'userVouchers'
      });
    }
  }
  
  Voucher.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
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
    maxDiscount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Voucher',
    tableName: 'vouchers'
  });
  
  return Voucher;
};