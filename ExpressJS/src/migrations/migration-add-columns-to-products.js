'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'shopId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow null initially, assuming existing data might not have shops
      references: {
        model: 'Shops',
        key: 'id'
      }
    });
    await queryInterface.addColumn('products', 'isActive', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'isActive');
    await queryInterface.removeColumn('products', 'shopId');
  }
};