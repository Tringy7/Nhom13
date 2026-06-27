'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(entities) {
      Conversation.belongsTo(entities.User, { foreignKey: 'userId', as: 'user' });
      Conversation.belongsTo(entities.User, { foreignKey: 'assignedManagerId', as: 'assignedManager' });
      Conversation.hasMany(entities.Message, { foreignKey: 'conversationId', as: 'messages' });
    }
  }
  Conversation.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    assignedManagerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' }
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Assigned', 'Resolved'),
      allowNull: false,
      defaultValue: 'Pending'
    }
  }, {
    sequelize,
    modelName: 'Conversation',
    tableName: 'Conversations'
  });
  return Conversation;
};