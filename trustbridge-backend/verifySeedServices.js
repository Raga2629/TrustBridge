const mongoose = require('mongoose');
const Service = require('./models/Service');

// MongoDB connection
const MONGO_URI = 'mongodb://localhost:27017/trustbridge';

async function verifySeedServices() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all services WITHOUT uploaded documents (seed data)
    const seedServices = await Service.find({
      $or: [
        { serviceImageUrl: { $exists: false } },
        { serviceImageUrl: null },
        { serviceImageUrl: '' },
        { businessProofUrl: { $exists: false } },
        { businessProofUrl: null },
        { businessProofUrl: '' }
      ]
    });

    console.log(`\n📊 Found ${seedServices.length} seed services without uploaded documents`);

    if (seedServices.length === 0) {
      console.log('✅ No seed services to verify!');
      process.exit(0);
    }

    console.log('\n🔄 Marking seed services as verified...');

    // Update all seed services to verified
    const result = await Service.updateMany(
      {
        $or: [
          { serviceImageUrl: { $exists: false } },
          { serviceImageUrl: null },
          { serviceImageUrl: '' },
          { businessProofUrl: { $exists: false } },
          { businessProofUrl: null },
          { businessProofUrl: '' }
        ]
      },
      {
        $set: { 
          verified: true,
          isVerified: true // Backward compatibility
        }
      }
    );

    console.log(`✅ Successfully verified ${result.modifiedCount} seed services`);

    // Show remaining unverified services (should be only new ones with documents)
    const unverifiedServices = await Service.find({ verified: false });
    
    console.log(`\n📋 Remaining unverified services: ${unverifiedServices.length}`);
    
    if (unverifiedServices.length > 0) {
      console.log('\n🔍 These services need admin verification:');
      unverifiedServices.forEach((service, index) => {
        console.log(`\n${index + 1}. ${service.name}`);
        console.log(`   Category: ${service.category}`);
        console.log(`   Location: ${service.area}, ${service.city}`);
        console.log(`   Service Image: ${service.serviceImageUrl ? '✅ Uploaded' : '❌ Missing'}`);
        console.log(`   Business Proof: ${service.businessProofUrl ? '✅ Uploaded' : '❌ Missing'}`);
        console.log(`   Contact: ${service.contactPhone || 'N/A'} | ${service.contactEmail || 'N/A'}`);
      });
    }

    console.log('\n✅ Done! Seed services are now verified.');
    console.log('💡 Only new services with uploaded documents will appear in admin verification queue.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifySeedServices();
