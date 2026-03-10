// Script to clean up incomplete registrations
// (Users with LOCAL_RESIDENT role but no Resident profile)
// Usage: node cleanupIncompleteRegistrations.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Resident = require('./models/Resident');

const cleanupIncomplete = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all LOCAL_RESIDENT users
    const localResidents = await User.find({ role: 'LOCAL_RESIDENT' });
    
    console.log(`📊 Found ${localResidents.length} LOCAL_RESIDENT users\n`);
    console.log('═══════════════════════════════════════════════════════════════');

    let incompleteCount = 0;
    let completeCount = 0;

    for (const user of localResidents) {
      // Check if has resident profile
      const resident = await Resident.findOne({ user: user._id });
      
      if (!resident) {
        incompleteCount++;
        console.log(`\n❌ INCOMPLETE: ${user.name} (${user.email})`);
        console.log(`   User ID: ${user._id}`);
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
        console.log(`   Status: User account exists but NO resident profile`);
        console.log(`   Action: This user should be deleted or complete registration`);
      } else {
        completeCount++;
        console.log(`\n✅ COMPLETE: ${user.name} (${user.email})`);
        console.log(`   Status: ${resident.verificationStatus}`);
        console.log(`   Location: ${resident.area}, ${resident.city}`);
      }
      
      console.log('───────────────────────────────────────────────────────────────');
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Complete registrations: ${completeCount}`);
    console.log(`   ❌ Incomplete registrations: ${incompleteCount}`);

    if (incompleteCount > 0) {
      console.log(`\n💡 To fix incomplete registrations:`);
      console.log(`   1. Delete the user: node deleteUserSimple.js`);
      console.log(`   2. Or have them complete registration again\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

cleanupIncomplete();
