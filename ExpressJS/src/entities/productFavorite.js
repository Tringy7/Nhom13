import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class ProductFavorite extends Model {
    static associate(entities) {
      ProductFavorite.belongsTo(entities.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      ProductFavorite.belongsTo(entities.Product, {
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