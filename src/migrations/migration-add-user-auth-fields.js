'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    await queryInterface.addColumn('users', 'otpHash', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('users', 'otpExpiresAt', {
      type: Sequelize.DATE
    });
    await queryInterface.addColumn('users', 'otpAttempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('users', 'otpLastSentAt', {
      type: Sequelize.DATE
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'otpLastSentAt');
    await queryInterface.removeColumn('users', 'otpAttempts');
    await queryInterface.removeColumn('users', 'otpExpiresAt');
    await queryInterface.removeColumn('users', 'otpHash');
    await queryInterface.removeColumn('users', 'isActive');
  }
};
