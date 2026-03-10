// Script to list all users in the database
// Usage: node listAllUsers.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Resident = require('./models/Resident');

const listUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find().select('name email role createdAt').sort('-createdAt');

    if (users.length === 0) {
      console.log('📭 No users found in database\n');
      process.exit(0);
    }

    console.log(`📊 Total Users: ${users.length}\n`);
    console.log('═══════════════════════════════════════════════════════════════');

    for (const user of users) {
      console.log(`\n👤 ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🎭 Role: ${user.role}`);
      console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
      
      // Check if has resident profile
      if (user.role === 'LOCAL_RESIDENT') {
        const resident = await Resident.findOne({ user: user._id });
        if (resident) {
          console.log(`   ✅ Resident Profile: ${resident.verificationStatus}`);
          console.log(`   📍 Location: ${resident.area}, ${resident.city}`);
        } else {
          console.log(`   ⚠️  No Resident Profile (incomplete registration)`);
        }
      }
      
      console.log('───────────────────────────────────────────────────────────────');
    }

    console.log('\n💡 To delete a user, run: node deleteUserSimple.js\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listUsers();
