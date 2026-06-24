import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(entities) {
      Report.belongsTo(entities.User, {
        foreignKey: 'reporterId',
        as: 'reporter'
      });
    }
  }
  Report.init({
    reporterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    targetType: {
      type: DataTypes.ENUM('PRODUCT', 'SHOP'),
      allowNull: false
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'RESOLVED', 'DISMISSED'),
      allowNull: false,
      defaultValue: 'PENDING'
    }
  }, {
    sequelize,
    modelName: 'Report',
    tableName: 'reports'
  });
  return Report;
};