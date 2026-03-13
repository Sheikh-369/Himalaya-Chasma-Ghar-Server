import 'reflect-metadata';          // ✅ Must be first
import app from './app';
import { config } from 'dotenv';
config();                          // Load .env variables

import sequelize from './database/connection';
import adminSeeder from './admin-seeder';

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    // 1️⃣ Connect to the database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // 2️⃣ Sync models
    await sequelize.sync({ alter: false }); // or { force: false } if you want
    console.log('✅ Database synced');

    // 3️⃣ Seed admin if needed
    await adminSeeder();
    console.log('✅ Admin seeding done');

    // 4️⃣ Start Express server
    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err);
  }
}

startServer();