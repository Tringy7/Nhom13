'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class OrderStatusHistory extends Model {
    static associate(entities) {
      const { Order, User } = entities;
      OrderStatusHistory.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
      OrderStatusHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'changedByUser' });
    }
  }

  OrderStatusHistory.init({
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Orders', key: 'id' }
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
      allowNull: true,
      references: { model: 'Users', key: 'id' }
    }
  }, {
    sequelize,
    modelName: 'OrderStatusHistory',
    tableName: 'OrderStatusHistories'
  });

  return OrderStatusHistory;
};
