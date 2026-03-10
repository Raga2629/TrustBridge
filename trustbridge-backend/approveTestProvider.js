/**
 * Manually approve the test provider
 * This will move it to the "Approved" tab
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trustbridge')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

const ServiceProvider = require('./models/ServiceProvider');

async function approveProvider() {
  console.log('\n🔄 APPROVING TEST PROVIDER\n');
  console.log('='.repeat(80));

  try {
    // Find the test provider
    const provider = await ServiceProvider.findOne({ email: 'testprovider@test.com' });
    
    if (!provider) {
      console.log('❌ Test provider not found');
      console.log('💡 Run: node seedTestVerification.js first');
      process.exit(1);
    }

    console.log('\n📋 Current Status:');
    console.log(`   Business: ${provider.businessName}`);
    console.log(`   Status: ${provider.verificationStatus}`);
    console.log(`   Score: ${provider.verificationScore}/100`);

    // Approve the provider
    provider.verificationStatus = 'APPROVED';
    provider.proofVerified = true;
    provider.verifiedAt = new Date();
    await provider.save();

    console.log('\n✅ PROVIDER APPROVED!\n');
    console.log('📋 New Status:');
    console.log(`   Business: ${provider.businessName}`);
    console.log(`   Status: ${provider.verificationStatus}`);
    console.log(`   Verified: ${provider.proofVerified}`);
    console.log(`   Verified At: ${provider.verifiedAt}`);

    console.log('\n🌐 TEST IT:');
    console.log('1. Go to: http://localhost:5173/admin/service-verification');
    console.log('2. Click "Approved" tab');
    console.log('3. You should see the provider there!');

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Done!\n');
  }
}

approveProvider();
