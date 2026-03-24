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

/* ================= ASSOCIATIONS ================= */

// Order ↔ OrderItem
Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Product ↔ OrderItem
Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

export default sequelize;