'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RewardTransaction extends Model {
    static associate(models) {
      RewardTransaction.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      RewardTransaction.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order'
      });
    }
  }
  
  RewardTransaction.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    type: {
      type: DataTypes.ENUM('EARN', 'SPEND'),
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: DataTypes.STRING,
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'orders', key: 'id' }
    }
  }, {
    sequelize,
    modelName: 'RewardTransaction',
    tableName: 'reward_transactions',
    updatedAt: false // Chỉ cần createdAt
  });
  
  return RewardTransaction;
};