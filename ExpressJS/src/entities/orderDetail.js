'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    static associate(entities) {
      OrderDetail.belongsTo(entities.Order, { foreignKey: 'orderId', as: 'order' });
      OrderDetail.belongsTo(entities.Product, { foreignKey: 'productId', as: 'product' });
    }
  }
  OrderDetail.init({
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Orders', key: 'id' }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Changed to true to match migration
      references: { model: 'Products', key: 'id' }
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'OrderDetail',
    tableName: 'OrderDetails'
  });
  return OrderDetail;
};