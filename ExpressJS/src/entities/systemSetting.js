'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SystemSetting extends Model {}

  SystemSetting.init({
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    group: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'general'
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    inputType: {
      type: DataTypes.ENUM('text', 'textarea', 'number', 'boolean', 'email', 'url'),
      allowNull: false,
      defaultValue: 'text'
    }
  }, {
    sequelize,
    modelName: 'SystemSetting',
    tableName: 'systemsettings'
  });

  return SystemSetting;
};
