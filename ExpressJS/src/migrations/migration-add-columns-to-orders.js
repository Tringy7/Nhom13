'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'shopId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Shops',
        key: 'id'
      }
    });
    await queryInterface.addColumn('orders', 'shipperId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    });

    // To add 'REQUEST_CANCEL' to ENUM, it might require a raw query depending on the dialect
    // For simplicity, assuming MySQL/PostgreSQL, we'll try to change column type.
    // In actual production, this can be tricky and depends on the DBMS.
    await queryInterface.changeColumn('orders', 'status', {
        type: Sequelize.ENUM(
            'NEW',
            'PROCESSING',
            'SHIPPED',
            'DELIVERED',
            'CANCELED',
            'RETURNED',
            'REQUEST_CANCEL'
        ),
        allowNull: false,
        defaultValue: 'NEW'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Note: Reverting ENUM might require recreating the column or raw queries.
    // For simplicity we'll drop the added columns.
    await queryInterface.removeColumn('orders', 'shipperId');
    await queryInterface.removeColumn('orders', 'shopId');
  }
};