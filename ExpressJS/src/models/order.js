'use strict';
const { Model } = require('sequelize');
const { ORDER_STATUS } = require('../constants/order.constants');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
      Order.hasOne(models.Payment, { foreignKey: 'orderId', as: 'payment' });
      Order.hasMany(models.OrderStatusHistory, { foreignKey: 'orderId', as: 'statusHistory' });
      Order.hasMany(models.ProductReview, { foreignKey: 'orderId', as: 'reviews' });
    }
  }
  Order.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    originalTotalPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    discountAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    couponCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pointsRedeemed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    shippingAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ORDER_STATUS)),
      allowNull: false,
      defaultValue: ORDER_STATUS.NEW
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelRequestedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders'
  });
  return Order;
};