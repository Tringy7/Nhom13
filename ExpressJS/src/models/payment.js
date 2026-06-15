'use strict';
const { Model } = require('sequelize');
const { PAYMENT_METHOD, PAYMENT_STATUS } = require('../constants/payment.constants');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
    }
  }
  Payment.init({
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    method: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_METHOD)),
      defaultValue: PAYMENT_METHOD.COD
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
      defaultValue: PAYMENT_STATUS.PENDING
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments'
  });
  return Payment;
};