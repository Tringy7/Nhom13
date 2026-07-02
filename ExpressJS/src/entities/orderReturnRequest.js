'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class OrderReturnRequest extends Model {
    static associate(models) {
      this.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      this.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'approver' });
    }
  }
  OrderReturnRequest.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
    },
    adminNotes: {
      type: DataTypes.TEXT,
    },
    processedAt: {
      type: DataTypes.DATE,
    },
    approvedBy: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'OrderReturnRequest',
    tableName: 'orderreturnrequests',
    timestamps: true,
  });
  return OrderReturnRequest;
};