'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('promotions', 'shopId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Shops',
        key: 'id'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('promotions', 'shopId');
  }
};