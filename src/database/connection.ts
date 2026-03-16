import { Sequelize } from "sequelize-typescript";
import { config } from "dotenv";
config();

import User from "./model/user-model";
import Product from "./model/product-model";
import Order from "./model/order-modal";
import OrderItem from "./model/order-item-model";

const sequelize = new Sequelize(process.env.CONNECTION_STRING as string, {
    models: [User,Product,Order,OrderItem],
});

async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log("✅ Authentication was successful.");

        await sequelize.sync({ alter: false });
        console.log("✅ Migration successful.");
    } catch (error) {
        console.error("❌ Database error:", error);
    }
}

initializeDatabase();

export default sequelize;