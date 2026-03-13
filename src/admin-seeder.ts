import bcrypt from 'bcrypt';
import User from './database/model/user-model';

const adminSeeder = async () => {
  try {
    // Ensure environment variables exist
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_USERNAME) {
      console.error("❌ Missing admin environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME)");
      return;
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { userEmail: process.env.ADMIN_EMAIL }
    });

    if (!existingAdmin) {
      // Hash password securely (async)
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      await User.create({
        userName: process.env.ADMIN_USERNAME,
        userPassword: hashedPassword,
        userEmail: process.env.ADMIN_EMAIL,
        whatsAppNumber:process.env.ADMIN_PHONE_NUMBER,
        role: "admin"
      });

      console.log("✅ Admin seeded successfully!");
    } else {
      console.log("✅Admin already exists.");
    }

  } catch (error) {
    console.error("❌ Error seeding admin:", error);
  }
};


export default adminSeeder;