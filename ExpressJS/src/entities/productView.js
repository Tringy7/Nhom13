'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductView extends Model {
    static associate(entities) {
      ProductView.belongsTo(entities.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      ProductView.belongsTo(entities.Product, {
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }

  ProductView.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    viewedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'ProductView',
    tableName: 'product_views'
  });

  return ProductView;
};