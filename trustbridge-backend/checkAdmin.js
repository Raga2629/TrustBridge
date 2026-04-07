const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const checkAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'nasaniragamala@gmail.com' });
    
    if (!admin) {
      console.log('❌ Admin user NOT found!');
      console.log('Run: node seedAdmin.js to create admin user');
      process.exit(1);
    }

    console.log('\n✅ Admin user found!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🛡️  Role:', admin.role);
    console.log('✓ Verified:', admin.isVerified);
    console.log('💯 Trust Score:', admin.trustScore);
    console.log('🔑 Password Hash:', admin.password.substring(0, 20) + '...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Test password
    const isMatch = await admin.matchPassword('raga@123');
    console.log('\n🔐 Password Test (raga@123):', isMatch ? '✅ CORRECT' : '❌ WRONG');
    
    if (!isMatch) {
      console.log('\n⚠️  Password does not match! You may need to reset the admin user.');
      console.log('Run: node seedAdmin.js (delete existing admin first if needed)');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkAdmin();
