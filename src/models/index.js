import { DataTypes } from "sequelize";
import { sequelize } from "../config/configdb";
import userFactory from "./user";

const User = userFactory(sequelize, DataTypes);

const db = {
    sequelize,
    User,
};

export { sequelize, User };
export default db;
