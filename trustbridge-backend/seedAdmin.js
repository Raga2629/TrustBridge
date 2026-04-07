const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'nasaniragamala@gmail.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('raga@123', salt);

    // Create admin user
    const admin = await User.create({
      name: 'Nasani Ragamala',
      email: 'nasaniragamala@gmail.com',
      password: hashedPassword,
      phone: '+91 9876543210',
      role: 'ADMIN',
      city: 'Hyderabad',
      isVerified: true,
      trustScore: 100
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Password: raga@123');
    console.log('🛡️  Role:', admin.role);
    console.log('✓ Verified:', admin.isVerified);
    console.log('💯 Trust Score:', admin.trustScore);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 You can now login at: http://localhost:5173/admin/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
