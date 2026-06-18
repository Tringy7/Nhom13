'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VendorWallet extends Model {
    static associate(entities) {
      VendorWallet.belongsTo(entities.Shop, {
        foreignKey: 'shopId',
        as: 'shop'
      });
      VendorWallet.hasMany(entities.WithdrawalRequest, {
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