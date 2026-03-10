// Quick script to delete a user and allow re-registration
// Usage: node deleteUserSimple.js

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const User = require('./models/User');
const Resident = require('./models/Resident');

const deleteUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Ask for email
    rl.question('Enter the email address to delete: ', async (email) => {
      if (!email || email.trim() === '') {
        console.log('❌ Email is required');
        process.exit(1);
      }

      const emailToDelete = email.trim().toLowerCase();

      // Find user
      const user = await User.findOne({ email: emailToDelete });
      
      if (!user) {
        console.log(`\n❌ User with email "${emailToDelete}" not found`);
        console.log('✅ You can register with this email!\n');
        process.exit(0);
      }

      console.log(`\n📧 Found user: ${user.name} (${user.email})`);
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
      console.log('✅ You can now register with this email again.\n');

      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

deleteUser();
