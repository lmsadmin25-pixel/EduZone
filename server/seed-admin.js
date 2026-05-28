// Seed script to create initial admin account
// Run: node seed-admin.js

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for seeding');

    // Check if admin already exists
    const existing = await Admin.findOne({ email: 'admin@eduzone.com' });
    if (existing) {
      console.log('⚠️ Admin already exists:', existing.email);
      process.exit(0);
    }

    // Create admin
    const admin = await Admin.create({
      name: 'EduZone Admin',
      email: 'admin@eduzone.com',
      password: 'ALIVEis5070'
    });

    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: admin@eduzone.com');
    console.log('🔑 Password: ALIVEis5070');
    console.log('');
    console.log('⚠️ Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
