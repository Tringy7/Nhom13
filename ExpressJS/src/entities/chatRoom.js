'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(entities) {
      Conversation.belongsTo(entities.User, { foreignKey: 'userId', as: 'user' });
      Conversation.belongsTo(entities.User, { foreignKey: 'adminId', as: 'admin' });
      Conversation.hasMany(entities.Message, { foreignKey: 'conversationId', as: 'messages' });
    }
  }
  Conversation.init({
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
    modelName: 'Conversation',
    tableName: 'Conversations'
  });
  return Conversation;
};