'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, change the column to string type temporarily to avoid ENUM strictness during update
    await queryInterface.changeColumn('payments', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'PENDING'
    });

    // Update existing data to conform to the new uppercase ENUM values
    await queryInterface.sequelize.query("UPDATE `payments` SET `status` = 'PENDING' WHERE `status` = 'pending'");
    await queryInterface.sequelize.query("UPDATE `payments` SET `status` = 'PAID' WHERE `status` = 'paid'");
    await queryInterface.sequelize.query("UPDATE `payments` SET `status` = 'FAILED' WHERE `status` = 'failed'");
    await queryInterface.sequelize.query("UPDATE `payments` SET `status` = 'REFUNDED' WHERE `status` = 'refunded'");

    // Now, change the column definition to the new uppercase ENUM
    await queryInterface.changeColumn('payments', 'status', {
      type: Sequelize.ENUM(
        'PENDING',
        'PROCESSING',
        'PAID',
        'FAILED',
        'REFUNDED'
      ),
      allowNull: false,
      defaultValue: 'PENDING'
    });
  },

  async down(queryInterface, Sequelize) {
    // First, change the column to string type temporarily
    await queryInterface.changeColumn('payments', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending'
    });

    // Revert existing data to lowercase ENUM values
    await queryInterface.sequelize.query("UPDATE `payments` SET `status` = 'pending' WHERE `status` = 'PENDING'");
    await queryInterface.sequelize.query("UPDATE `payments` SET `status` = 'paid' WHERE `status` = 'PAID'");
    await queryInterface.sequelize.query("UPDATE `payments` SET `status` = 'failed' WHERE `status` = 'FAILED'");
    await queryInterface.sequelize.query("UPDATE `payments` SET `status` = 'refunded' WHERE `status` = 'REFUNDED'");

    // We'll revert to the lowercase definition.
    await queryInterface.changeColumn('payments', 'status', {
      type: Sequelize.ENUM(
        'pending',
        'paid',
        'failed',
        'refunded'
      ),
      allowNull: false,
      defaultValue: 'pending'
    });
  }
};
