'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderStatusHistory extends Model {
    static associate(entities) {
      OrderStatusHistory.belongsTo(entities.Order, { foreignKey: 'orderId', as: 'order' });
      OrderStatusHistory.belongsTo(entities.User, { foreignKey: 'changedBy', as: 'changedByUser' });
    }
  }
  OrderStatusHistory.init({
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    changedBy: {
      type: DataTypes.INTEGER,
      allowNull: true // null = hệ thống tự động
    }
  }, {
    sequelize,
    modelName: 'OrderStatusHistory',
    tableName: 'order_status_histories'
  });
  return OrderStatusHistory;
};