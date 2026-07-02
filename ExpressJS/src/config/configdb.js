import { Sequelize } from 'sequelize';
//const { Sequelize } = require('sequelize');//ES5 module

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize('uteshop', 'root', '1234', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const ensureUsersRoleColumn = async () => {
    const queryInterface = sequelize.getQueryInterface();
    const tableName = 'Users';

    const columns = await queryInterface.describeTable(tableName);
    if (!Object.prototype.hasOwnProperty.call(columns, 'role')) {
        await queryInterface.addColumn(tableName, 'role', {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: 'user'
        });
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
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export default connectDB;