'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class PromotionProduct extends Model {
    static associate(entities) {
      PromotionProduct.belongsTo(entities.Promotion, { foreignKey: 'promotionId' });
      PromotionProduct.belongsTo(entities.Product, { foreignKey: 'productId' });
    }
  }
  PromotionProduct.init({
    promotionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'promotions',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'PromotionProduct',
    tableName: 'promotion_products'
  });
  return PromotionProduct;
};