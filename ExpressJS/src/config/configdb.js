import { Sequelize } from 'sequelize';
//const { Sequelize } = require('sequelize');//ES5 module

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize('uteshop', 'root', '123456', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const ensureUsersColumns = async () => {
    const queryInterface = sequelize.getQueryInterface();
    const tableName = 'Users';

    const columns = await queryInterface.describeTable(tableName);

    const requiredColumns = {
        address: {
            type: Sequelize.STRING,
            allowNull: true
        },
        gender: {
            type: Sequelize.STRING,
            allowNull: true
        },
        points: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        role: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'user'
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'ACTIVE'
        },
        refreshToken: {
            type: Sequelize.STRING,
            allowNull: true
        },
        refreshTokenExpiresAt: {
            type: Sequelize.DATE,
            allowNull: true
        }
    };

    for (const [columnName, definition] of Object.entries(requiredColumns)) {
        if (!Object.prototype.hasOwnProperty.call(columns, columnName)) {
            await queryInterface.addColumn(tableName, columnName, definition);
            console.log(`Added missing Users.${columnName} column`);
        }
    }
};

const ensureProductReviewsOrderIdColumn = async () => {
    const queryInterface = sequelize.getQueryInterface();
    const tableName = 'product_reviews';

    try {
        const columns = await queryInterface.describeTable(tableName);
        if (!Object.prototype.hasOwnProperty.call(columns, 'orderId')) {
            await queryInterface.addColumn(tableName, 'orderId', {
                type: Sequelize.INTEGER,
                allowNull: true
            });
            console.log("Added 'orderId' column to 'product_reviews' table.");
        }
    } catch (err) {
        console.error("Error ensuring orderId column in product_reviews:", err.message);
    }
};

let connectDB = async () => {
    try {
        await sequelize.authenticate();
        await ensureUsersRoleColumn();
        await ensureProductReviewsOrderIdColumn();
        await ensureUsersColumns();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export default connectDB;
