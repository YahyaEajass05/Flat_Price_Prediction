/**
 * Seed Admin User Script
 * Creates a default admin user in the database
 * 
 * Usage: node backend/scripts/seedAdmin.js
 */

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const ADMIN_CREDENTIALS = {
  name: 'Admin',
  email: 'admin@flatprice.com',
  password: 'admin123456',
  role: 'admin',
  isEmailVerified: true,
  predictionLimit: Infinity,
  predictionCount: 0,
};

const seedAdmin = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flat_price_prediction', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_CREDENTIALS.email });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Created: ${existingAdmin.createdAt}`);
      
      // Ask if user wants to reset password
      console.log('\n💡 If you want to reset admin password, delete the user first:');
      console.log(`   db.users.deleteOne({ email: '${ADMIN_CREDENTIALS.email}' })`);
      
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    console.log('\n👤 Creating admin user...');
    const admin = await User.create(ADMIN_CREDENTIALS);

    console.log('\n✅ Admin user created successfully!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📧 Email:    ', ADMIN_CREDENTIALS.email);
    console.log('🔑 Password: ', ADMIN_CREDENTIALS.password);
    console.log('👑 Role:     ', admin.role);
    console.log('🆔 User ID:  ', admin._id);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\n🔐 You can now login at: http://localhost:3000/login');

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  }
};

// Run the seeder
seedAdmin();
