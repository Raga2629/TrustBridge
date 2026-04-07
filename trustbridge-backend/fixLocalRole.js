const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const fixLocalRole = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Update all users with role LOCAL to LOCAL_RESIDENT
    const result = await User.updateMany(
      { role: 'LOCAL' },
      { $set: { role: 'LOCAL_RESIDENT' } }
    );

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Role Fix Complete!');
    console.log('📊 Updated', result.modifiedCount, 'user(s)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (result.modifiedCount > 0) {
      console.log('\n⚠️  IMPORTANT: Users need to logout and login again!');
    } else {
      console.log('\n✓ No users with role LOCAL found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing roles:', error);
    process.exit(1);
  }
};

fixLocalRole();
