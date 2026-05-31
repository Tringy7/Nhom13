'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('orders', 'totalPrice', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
    });
    await queryInterface.changeColumn('orders', 'originalTotalPrice', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.changeColumn('orders', 'discountAmount', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.changeColumn('payments', 'amount', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes, which might cause data loss if new values are too large
    await queryInterface.changeColumn('orders', 'totalPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });
    await queryInterface.changeColumn('orders', 'originalTotalPrice', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.changeColumn('orders', 'discountAmount', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.changeColumn('payments', 'amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });
  }
};