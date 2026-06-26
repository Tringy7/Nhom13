'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Brand extends Model {
    static associate(entities) {
      Brand.hasMany(entities.Product, {
        foreignKey: 'brandId',
        as: 'products'
      });
    }
  }
  Brand.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Brand',
    tableName: 'brands'
  });
  return Brand;
};