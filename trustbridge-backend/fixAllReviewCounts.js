const mongoose = require('mongoose');
const Service = require('./models/Service');
const Review = require('./models/Review');
require('dotenv').config();

const fixAllReviewCounts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Get all services
    const services = await Service.find();
    
    console.log(`📊 Found ${services.length} services. Fixing review counts...\n`);
    
    let fixed = 0;
    
    for (const service of services) {
      // Count actual approved reviews
      const actualReviews = await Review.countDocuments({ 
        service: service._id,
        isSpamDetected: false,
        isApproved: true
      });
      
      // Get all approved reviews for rating calculation
      const approvedReviews = await Review.find({
        service: service._id,
        isSpamDetected: false,
        isApproved: true
      });
      
      // Calculate average rating
      let avgRating = 0;
      if (approvedReviews.length > 0) {
        const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
        avgRating = totalRating / approvedReviews.length;
      }
      
      // Update service
      await Service.findByIdAndUpdate(service._id, {
        rating: avgRating,
        averageRating: avgRating,
        totalReviews: actualReviews,
        reviewCount: actualReviews
      });
      
      console.log(`✅ ${service.name}`);
      console.log(`   Reviews: ${actualReviews}`);
      console.log(`   Rating: ${avgRating.toFixed(2)}`);
      console.log('');
      
      fixed++;
    }
    
    console.log(`\n🎉 Fixed ${fixed} services!`);
    console.log('✅ All review counts are now accurate.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixAllReviewCounts();
