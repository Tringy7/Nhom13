import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(entities) {
      OrderItem.belongsTo(entities.Order, { foreignKey: 'orderId', as: 'order' });
      OrderItem.belongsTo(entities.Product, { foreignKey: 'productId', as: 'product' });
    }
  }
  OrderItem.init({
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
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
    modelName: 'OrderItem',
    tableName: 'order_items'
  });
  return OrderItem;
};