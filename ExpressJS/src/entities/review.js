'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(entities) {
      Review.belongsTo(entities.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  Review.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    targetType: {
      type: DataTypes.ENUM('PRODUCT', 'ORDER', 'SHOP'),
      allowNull: false
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews'
  });
  return Review;
};