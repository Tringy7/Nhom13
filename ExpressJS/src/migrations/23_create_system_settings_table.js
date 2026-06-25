'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('systemsettings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      group: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'general'
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false
      },
      inputType: {
        type: Sequelize.ENUM('text', 'textarea', 'number', 'boolean', 'email', 'url'),
        allowNull: false,
        defaultValue: 'text'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('systemsettings');
  }
};
