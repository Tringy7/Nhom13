'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WithdrawalRequest extends Model {
    static associate(entities) {
      WithdrawalRequest.belongsTo(entities.VendorWallet, {
        foreignKey: 'walletId',
        as: 'wallet'
      });
    }
  }
  WithdrawalRequest.init({
    walletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vendor_wallets',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'WithdrawalRequest',
    tableName: 'withdrawal_requests'
  });
  return WithdrawalRequest;
};