'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // To prevent errors on different DB systems, we might need to drop and re-add the column
    // A safer way for production is to add a new column, migrate data, drop old, rename new.
    // For this project, we'll use changeColumn with a raw query for MySQL to handle ENUM changes.
    
    // First, update existing data to conform to the new ENUM values before changing the definition.
    await queryInterface.sequelize.query("UPDATE `orders` SET `status` = 'new' WHERE `status` = 'PENDING'");
    await queryInterface.sequelize.query("UPDATE `orders` SET `status` = 'confirmed' WHERE `status` = 'PAID'");
    await queryInterface.sequelize.query("UPDATE `orders` SET `status` = 'delivered' WHERE `status` = 'COMPLETED'");
    await queryInterface.sequelize.query("UPDATE `orders` SET `status` = 'cancelled' WHERE `status` = 'CANCELLED'");

    // Now, change the column definition
    await queryInterface.changeColumn('orders', 'status', {
      type: Sequelize.ENUM(
        'new',
        'confirmed',
        'preparing',
        'shipping',
        'delivered',
        'cancelled',
        'cancel_request'
      ),
      allowNull: false,
      defaultValue: 'new'
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverting this is complex and potentially data-destructive.
    // We'll revert to the old definition.
    await queryInterface.changeColumn('orders', 'status', {
      type: Sequelize.ENUM(
        'PENDING',
        'PAID',
        'CANCELLED',
        'COMPLETED'
      ),
      allowNull: false,
      defaultValue: 'PENDING'
    });
  }
};