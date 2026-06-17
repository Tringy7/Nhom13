'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VendorWallet extends Model {
    static associate(models) {
      VendorWallet.belongsTo(models.Shop, {
        foreignKey: 'shopId',
        as: 'shop'
      });
      VendorWallet.hasMany(models.WithdrawalRequest, {
        foreignKey: 'walletId',
        as: 'withdrawalRequests'
      });
    }
  }
  VendorWallet.init({
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Shops',
        key: 'id'
      }
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'VendorWallet',
    tableName: 'vendor_wallets'
  });
  return VendorWallet;
};