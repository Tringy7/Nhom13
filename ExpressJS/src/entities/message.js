'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(entities) {
      Message.belongsTo(entities.ChatRoom, { foreignKey: 'roomId', as: 'room' });
      Message.belongsTo(entities.User, { foreignKey: 'senderId', as: 'sender' });
    }
  }
  Message.init({
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'chat_rooms', key: 'id' }
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