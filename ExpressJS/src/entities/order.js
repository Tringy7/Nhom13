'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(entities) {
      const { User, Voucher, OrderDetail, Review, OrderCancellationRequest, OrderReturnRequest, Payment, OrderStatusHistory } = entities;
      
      Order.belongsTo(User, { foreignKey: 'userId', as: 'customer' });
      Order.belongsTo(User, { foreignKey: 'shipperId', as: 'shipper' });
      Order.belongsTo(Voucher, { foreignKey: 'voucherId', as: 'voucher' });
      Order.hasMany(OrderDetail, { foreignKey: 'orderId', as: 'details' });
      Order.hasMany(Review, { foreignKey: 'orderId', as: 'reviews' });
      Order.hasOne(OrderCancellationRequest, { foreignKey: 'orderId', as: 'cancellationRequest' });
      Order.hasOne(OrderReturnRequest, { foreignKey: 'orderId', as: 'returnRequest' });
      Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment' });
      Order.hasMany(OrderStatusHistory, { foreignKey: 'orderId', as: 'statusHistory' });
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
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    voucherDiscount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    pointsDiscount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
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
      type: DataTypes.ENUM('NEW', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'CANCEL_REQUEST', 'DELIVERY_FAILED', 'RETURN_REQUEST', 'RETURNED'),
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