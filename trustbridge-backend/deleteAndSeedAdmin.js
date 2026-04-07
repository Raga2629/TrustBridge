const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const deleteAndSeedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin
    const deleted = await User.deleteOne({ email: 'nasaniragamala@gmail.com' });
    console.log('🗑️  Deleted existing admin:', deleted.deletedCount > 0 ? 'Yes' : 'No');

    // Create admin user (password will be hashed by pre-save hook)
    const admin = await User.create({
      name: 'Nasani Ragamala',
      email: 'nasaniragamala@gmail.com',
      password: 'raga@123',
      phone: '+91 9876543210',
      role: 'ADMIN',
      city: 'Hyderabad',
      isVerified: true,
      trustScore: 100
    });

    console.log('\n✅ Admin user created successfully!');
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
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

deleteAndSeedAdmin();
