'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductFavorite extends Model {
    static associate(models) {
      ProductFavorite.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      ProductFavorite.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }

  ProductFavorite.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ProductFavorite',
    tableName: 'product_favorites'
  });

  return ProductFavorite;
};