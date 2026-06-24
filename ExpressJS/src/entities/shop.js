import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Shop extends Model {
    static associate(entities) {
      Shop.belongsTo(entities.User, {
        foreignKey: 'userId',
        as: 'owner'
      });
      // Các association dưới đây bị comment vì bảng products/orders/promotions
      // không có cột 'shopId' trong DB hiện tại
      // Shop.hasMany(entities.Product, {
      //   foreignKey: 'shopId',
      //   as: 'products'
      // });
      // Shop.hasMany(entities.Order, {
      //   foreignKey: 'shopId',
      //   as: 'orders'
      // });
      // Shop.hasMany(entities.Promotion, {
      //   foreignKey: 'shopId',
      //   as: 'promotions'
      // });
      Shop.hasOne(entities.VendorWallet, {
        foreignKey: 'shopId',
        as: 'wallet'
      });
    }
  }
  Shop.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACTIVE', 'REJECTED', 'LOCKED'),
      allowNull: false,
      defaultValue: 'PENDING'
    }
  }, {
    sequelize,
    modelName: 'Shop',
    tableName: 'shops'
  });
  return Shop;
};