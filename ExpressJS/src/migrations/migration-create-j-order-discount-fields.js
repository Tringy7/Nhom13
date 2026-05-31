'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'originalTotalPrice', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('orders', 'discountAmount', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('orders', 'couponCode', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('orders', 'pointsRedeemed', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orders', 'pointsRedeemed');
    await queryInterface.removeColumn('orders', 'couponCode');
    await queryInterface.removeColumn('orders', 'discountAmount');
    await queryInterface.removeColumn('orders', 'originalTotalPrice');
  }
};