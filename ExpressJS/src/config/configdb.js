import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
});

const ensureUsersRoleColumn = async () => {
    const queryInterface = sequelize.getQueryInterface();
    const tableName = 'users';

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