'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_vouchers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      voucherId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'vouchers', key: 'id' }
      },
      rewardCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      receivedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      usedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_vouchers');
  }
};