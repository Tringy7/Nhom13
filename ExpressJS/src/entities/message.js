'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(entities) {
      Message.belongsTo(entities.Conversation, { foreignKey: 'conversationId', as: 'conversation' });
      Message.belongsTo(entities.User, { foreignKey: 'senderId', as: 'sender' });
    }
  }
  Message.init({
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Conversations', key: 'id' }
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'Messages'
  });
  return Message;
};