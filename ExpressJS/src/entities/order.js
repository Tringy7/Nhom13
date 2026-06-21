'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(entities) {
      Order.belongsTo(entities.User, { foreignKey: 'userId', as: 'customer' });
      Order.belongsTo(entities.User, { foreignKey: 'shipperId', as: 'shipper' });
      Order.belongsTo(entities.Voucher, { foreignKey: 'voucherId', as: 'voucher' });
      Order.hasMany(entities.OrderDetail, { foreignKey: 'orderId', as: 'details' });
      Order.hasMany(entities.Review, { foreignKey: 'orderId', as: 'reviews' });
      Order.hasOne(entities.OrderCancellationRequest, { foreignKey: 'orderId', as: 'cancellationRequest' });

      // Establishes the one-to-one relationship with Payment
      Order.hasOne(entities.Payment, { foreignKey: 'orderId', as: 'payment' });
    }
  }
  Order.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    voucherId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Vouchers', key: 'id' }
    },
    shipperId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' }
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    shippingFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    shipperFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    shippingMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderStatus: {
      type: DataTypes.ENUM('NEW', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'CANCEL_REQUEST', 'DELIVERY_FAILED'),
      allowNull: false,
      defaultValue: 'NEW'
    },
    shippingAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders'
  });
  return Order;
};