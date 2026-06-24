import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserVoucher extends Model {
    static associate(entities) {
      UserVoucher.belongsTo(entities.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      UserVoucher.belongsTo(entities.Voucher, {
        foreignKey: 'voucherId',
        as: 'voucher'
      });
    }
  }
  
  UserVoucher.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    voucherId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'vouchers', key: 'id' }
    },
    rewardCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Mỗi lần nhận sinh ra 1 mã duy nhất cho user
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true // true = chưa dùng
    },
    receivedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'UserVoucher',
    tableName: 'user_vouchers',
    timestamps: false
  });
  
  return UserVoucher;
};