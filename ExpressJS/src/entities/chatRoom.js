'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class ChatRoom extends Model {
    static associate(entities) {
      ChatRoom.belongsTo(entities.User, { foreignKey: 'userId', as: 'user' });
      ChatRoom.belongsTo(entities.User, { foreignKey: 'adminId', as: 'admin' });
      ChatRoom.hasMany(entities.ChatMessage, { foreignKey: 'roomId', as: 'messages' });
    }
  }
  ChatRoom.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    }
  }, {
    sequelize,
    modelName: 'ChatRoom',
    tableName: 'Conversations'
  });
  return ChatRoom;
};