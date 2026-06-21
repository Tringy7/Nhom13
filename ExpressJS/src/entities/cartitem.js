'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(entities) {
      CartItem.belongsTo(entities.Cart, { foreignKey: 'cartId', as: 'cart' });
      CartItem.belongsTo(entities.Product, { foreignKey: 'productId', as: 'product' });
    }
  }
  CartItem.init({
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Carts', key: 'id' }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Products', key: 'id' }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'CartItems'
  });
  return CartItem;
};