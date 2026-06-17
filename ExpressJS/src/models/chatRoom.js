'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatRoom extends Model {
    static associate(models) {
      ChatRoom.belongsToMany(models.User, {
        through: 'ChatRoomParticipants',
        foreignKey: 'roomId',
        otherKey: 'userId',
        as: 'participants'
      });
      ChatRoom.hasMany(models.ChatMessage, {
        foreignKey: 'roomId',
        as: 'messages'
      });
    }
  }
  ChatRoom.init({}, {
    sequelize,
    modelName: 'ChatRoom',
    tableName: 'chat_rooms'
  });
  return ChatRoom;
};