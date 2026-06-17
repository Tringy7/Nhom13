'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Tạo bảng vouchers
    await queryInterface.createTable('vouchers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      discountType: {
        type: Sequelize.ENUM('PERCENT', 'FIXED'),
        allowNull: false,
      },
      discountValue: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      minOrderValue: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      maxDiscount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      startDate: {
        type: Sequelize.DATE,
      },
      endDate: {
        type: Sequelize.DATE,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });

    // 2. Tạo bảng user_vouchers
    await queryInterface.createTable('user_vouchers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Tên bảng users trong DB
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      voucherId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'vouchers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rewardCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true, // true = chưa dùng
      },
      receivedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      usedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      }
    });

    // 3. Tạo bảng reward_transactions
    await queryInterface.createTable('reward_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('EARN', 'SPEND'),
        allowNull: false,
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('reward_transactions');
    await queryInterface.dropTable('user_vouchers');
    await queryInterface.dropTable('vouchers');
  }
};