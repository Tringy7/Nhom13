'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserVoucher extends Model {
    static associate(entities) {
      UserVoucher.belongsTo(entities.User, { foreignKey: 'userId', as: 'user' });
      UserVoucher.belongsTo(entities.Voucher, { foreignKey: 'voucherId', as: 'voucher' });
    }
  }

  UserVoucher.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    voucherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Vouchers',
        key: 'id'
      }
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    receivedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'UserVoucher',
    tableName: 'uservouchers',
    timestamps: true
  });

  return UserVoucher;
};