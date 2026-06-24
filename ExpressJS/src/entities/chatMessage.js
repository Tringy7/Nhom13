import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class ChatMessage extends Model {
    static associate(entities) {
      ChatMessage.belongsTo(entities.ChatRoom, {
        foreignKey: 'roomId',
        as: 'room'
      });
      ChatMessage.belongsTo(entities.User, {
        foreignKey: 'senderId',
        as: 'sender'
      });
    }
  }
  ChatMessage.init({
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'chat_rooms',
        key: 'id'
      }
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ChatMessage',
    tableName: 'chat_messages'
  });
  return ChatMessage;
};