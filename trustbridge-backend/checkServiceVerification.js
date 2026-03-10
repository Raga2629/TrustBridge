const mongoose = require('mongoose');
const Service = require('./models/Service');
const User = require('./models/User');

// MongoDB connection
const MONGO_URI = 'mongodb://localhost:27017/trustbridge';

async function checkServices() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const allServices = await Service.find({}).populate('provider', 'name email role');
    const verifiedServices = await Service.find({ verified: true });
    const unverifiedServices = await Service.find({ verified: false });

    console.log('\n📊 SERVICE VERIFICATION STATUS:');
    console.log('================================');
    console.log(`Total Services: ${allServices.length}`);
    console.log(`Verified Services: ${verifiedServices.length}`);
    console.log(`Unverified Services: ${unverifiedServices.length}`);

    if (unverifiedServices.length > 0) {
      console.log('\n🔍 UNVERIFIED SERVICES:');
      console.log('========================');
      unverifiedServices.forEach((service, index) => {
        console.log(`\n${index + 1}. ${service.name}`);
        console.log(`   Category: ${service.category}`);
        console.log(`   Location: ${service.area}, ${service.city}`);
        console.log(`   Provider: ${service.provider?.name || 'N/A'} (${service.provider?.email || 'N/A'})`);
        console.log(`   Service Image: ${service.serviceImageUrl || 'Not uploaded'}`);
        console.log(`   Business Proof: ${service.businessProofUrl || 'Not uploaded'}`);
        console.log(`   Contact: ${service.contactPhone || 'N/A'} | ${service.contactEmail || 'N/A'}`);
      });
    } else {
      console.log('\n✅ All services are verified!');
      console.log('💡 To test the verification workflow:');
      console.log('   1. Login as a service provider');
      console.log('   2. Add a new service with required documents');
      console.log('   3. The service will appear in Admin > Service Verification');
    }

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkServices();
