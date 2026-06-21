'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      voucherId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Vouchers',
          key: 'id'
        }
      },
      shipperId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      totalAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      shippingFee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      shipperFee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      shippingMethod: {
        type: Sequelize.STRING,
        allowNull: true
      },
      orderStatus: {
        type: Sequelize.ENUM('NEW', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'CANCEL_REQUEST', 'DELIVERY_FAILED'),
        allowNull: false,
        defaultValue: 'NEW'
      },
      shippingAddress: {
        type: Sequelize.STRING,
        allowNull: false
      },
      note: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('Orders');
  }
};