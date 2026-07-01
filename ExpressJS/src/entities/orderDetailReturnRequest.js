'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class OrderDetailReturnRequest extends Model {
    static associate(models) {
      this.belongsTo(models.OrderDetail, {
        foreignKey: 'orderDetailId',
        as: 'orderDetail',
      });
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      this.belongsTo(models.User, {
        foreignKey: 'approvedBy',
        as: 'approver',
      });
    }
  }
  OrderDetailReturnRequest.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderDetailId: {
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
    modelName: 'OrderDetailReturnRequest',
    tableName: 'orderdetailreturnrequests',
    timestamps: true,
  });
  return OrderDetailReturnRequest;
};