/**
 * Find Provider and Resident IDs for Testing OCR Verification
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trustbridge')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

const ServiceProvider = require('./models/ServiceProvider');
const Resident = require('./models/Resident');

async function findIDs() {
  console.log('\n🔍 FINDING VERIFICATION IDS\n');
  console.log('='.repeat(80));

  try {
    // Find Service Providers
    console.log('\n📋 SERVICE PROVIDERS:\n');
    const providers = await ServiceProvider.find()
      .populate('user', 'name email')
      .limit(10);

    if (providers.length === 0) {
      console.log('❌ No service providers found in database');
      console.log('💡 Create a provider first by signing up as SERVICE_PROVIDER');
    } else {
      providers.forEach((provider, index) => {
        console.log(`${index + 1}. Provider ID: ${provider._id}`);
        console.log(`   Business: ${provider.businessName}`);
        console.log(`   Owner: ${provider.ownerName}`);
        console.log(`   Status: ${provider.verificationStatus}`);
        console.log(`   Score: ${provider.verificationScore || 0}/100`);
        console.log(`   URL: http://localhost:5173/admin/verification/provider/${provider._id}`);
        console.log('');
      });

      console.log('\n✅ COPY ONE OF THESE URLS TO TEST:\n');
      console.log(`   http://localhost:5173/admin/verification/provider/${providers[0]._id}`);
    }

    // Find Local Residents
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 LOCAL RESIDENTS:\n');
    const residents = await Resident.find()
      .populate('user', 'name email')
      .limit(10);

    if (residents.length === 0) {
      console.log('❌ No local residents found in database');
      console.log('💡 Create a resident first by signing up as LOCAL');
    } else {
      residents.forEach((resident, index) => {
        console.log(`${index + 1}. Resident ID: ${resident._id}`);
        console.log(`   User: ${resident.user?.name || 'Unknown'}`);
        console.log(`   Area: ${resident.area}, ${resident.city}`);
        console.log(`   Status: ${resident.verificationStatus}`);
        console.log(`   Score: ${resident.verificationScore || 0}/100`);
        console.log(`   URL: http://localhost:5173/admin/verification/resident/${resident._id}`);
        console.log('');
      });

      console.log('\n✅ COPY ONE OF THESE URLS TO TEST:\n');
      console.log(`   http://localhost:5173/admin/verification/resident/${residents[0]._id}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 SUMMARY:\n');
    console.log(`   Service Providers: ${providers.length}`);
    console.log(`   Local Residents: ${residents.length}`);

    if (providers.length === 0 && residents.length === 0) {
      console.log('\n⚠️  NO DATA FOUND!\n');
      console.log('To test OCR verification, you need to:');
      console.log('1. Sign up as a Service Provider or Local Resident');
      console.log('2. Upload documents during registration');
      console.log('3. Then use the verification URL shown above');
      console.log('\nOR run the seeder scripts:');
      console.log('   node seedServices.js');
      console.log('   node seedBachupallyServices.js');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Done!\n');
  }
}

findIDs();
