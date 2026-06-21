'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    static associate(entities) {
      Wishlist.belongsTo(entities.User, { foreignKey: 'userId', as: 'user' });
      Wishlist.belongsTo(entities.Product, { foreignKey: 'productId', as: 'product' });
    }
  }
  Wishlist.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Products', key: 'id' }
    }
  }, {
    sequelize,
    modelName: 'Wishlist',
    tableName: 'Wishlists'
  });
  return Wishlist;
};