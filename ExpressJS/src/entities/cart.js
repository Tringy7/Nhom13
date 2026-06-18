'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(entities) {
      Cart.belongsTo(entities.User, { foreignKey: 'userId', as: 'user' });
      Cart.hasMany(entities.CartItem, { foreignKey: 'cartId', as: 'items' });
    }
  }
  Cart.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' }
    }
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'carts'
  });
  return Cart;
};