'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vouchers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      code: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      title: Sequelize.STRING,
      description: Sequelize.TEXT,
      discountType: {
        type: Sequelize.ENUM('PERCENT', 'FIXED'),
        allowNull: false
      },
      discountValue: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      minOrderValue: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      maxDiscount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      startDate: Sequelize.DATE,
      endDate: Sequelize.DATE,
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vouchers');
  }
};