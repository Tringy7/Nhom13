'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class OrderCancellationRequest extends Model {
    static associate(entities) {
      OrderCancellationRequest.belongsTo(entities.Order, { foreignKey: 'orderId', as: 'order' });
      OrderCancellationRequest.belongsTo(entities.User, { foreignKey: 'userId', as: 'user' });
      OrderCancellationRequest.belongsTo(entities.User, { foreignKey: 'approvedBy', as: 'approver' });
    }
  }
  OrderCancellationRequest.init({
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Orders', key: 'id' }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' }
    },
    adminNotes: { // Added for admin's feedback
      type: DataTypes.TEXT,
      allowNull: true
    },
    processedAt: { // Added to track when the request was handled
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'OrderCancellationRequest',
    tableName: 'OrderCancellationRequests'
  });
  return OrderCancellationRequest;
};