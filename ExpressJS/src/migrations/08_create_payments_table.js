'use strict';
const { PAYMENT_METHOD, PAYMENT_STATUS } = require('../constants/payment.constants');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id'
        }
      },
      method: {
        type: Sequelize.ENUM(...Object.values(PAYMENT_METHOD)),
        defaultValue: PAYMENT_METHOD.COD
      },
      status: {
        type: Sequelize.ENUM(...Object.values(PAYMENT_STATUS)),
        defaultValue: PAYMENT_STATUS.PENDING
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payments');
  }
};