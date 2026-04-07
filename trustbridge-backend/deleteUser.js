// Script to delete a user by email
// Usage: node deleteUser.js <email>

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Resident = require('./models/Resident');

const deleteUserByEmail = async (email) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      process.exit(0);
    }

    console.log(`📧 Found user: ${user.name} (${user.email})`);
    console.log(`🔑 User ID: ${user._id}`);
    console.log(`👤 Role: ${user.role}`);

    // Delete associated resident profile if exists
    const resident = await Resident.findOne({ user: user._id });
    if (resident) {
      await Resident.deleteOne({ _id: resident._id });
      console.log('✅ Deleted resident profile');
    }

    // Delete user
    await User.deleteOne({ _id: user._id });
    console.log('✅ Deleted user account');

    console.log('\n🎉 User successfully deleted!');
    console.log('You can now register with this email again.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node deleteUser.js <email>');
  console.log('Example: node deleteUser.js srinidhi@gmail.com');
  process.exit(1);
}

deleteUserByEmail(email);
