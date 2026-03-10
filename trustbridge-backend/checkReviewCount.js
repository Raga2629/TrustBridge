const mongoose = require('mongoose');
const Service = require('./models/Service');
const Review = require('./models/Review');
require('dotenv').config();

const checkReviewCount = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Get all services
    const services = await Service.find();
    
    console.log('\n📊 SERVICE REVIEW COUNT CHECK:\n');
    
    for (const service of services) {
      // Count actual reviews
      const actualReviews = await Review.countDocuments({ 
        service: service._id,
        isSpamDetected: false,
        isApproved: true
      });
      
      console.log(`\n🔍 Service: ${service.name}`);
      console.log(`   ID: ${service._id}`);
      console.log(`   service.reviewCount: ${service.reviewCount}`);
      console.log(`   service.totalReviews: ${service.totalReviews}`);
      console.log(`   Actual reviews in DB: ${actualReviews}`);
      
      if (service.reviewCount !== actualReviews || service.totalReviews !== actualReviews) {
        console.log(`   ⚠️  MISMATCH! Updating...`);
        
        // Update the service
        await Service.findByIdAndUpdate(service._id, {
          reviewCount: actualReviews,
          totalReviews: actualReviews
        });
        
        console.log(`   ✅ Updated to ${actualReviews}`);
      } else {
        console.log(`   ✅ Counts are correct`);
      }
    }
    
    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkReviewCount();
