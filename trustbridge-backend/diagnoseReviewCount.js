const mongoose = require('mongoose');
const Service = require('./models/Service');
const Review = require('./models/Review');
require('dotenv').config();

const diagnoseReviewCount = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');
    console.log('🔍 DIAGNOSING REVIEW COUNT ISSUES\n');
    console.log('='.repeat(60));

    // Get all services
    const services = await Service.find();
    
    let issuesFound = 0;
    
    for (const service of services) {
      // Get all reviews (including spam and unapproved)
      const allReviews = await Review.find({ service: service._id });
      
      // Get approved reviews only
      const approvedReviews = await Review.find({ 
        service: service._id,
        isSpamDetected: false,
        isApproved: true
      });
      
      // Get spam reviews
      const spamReviews = await Review.find({ 
        service: service._id,
        isSpamDetected: true
      });
      
      // Get unapproved reviews
      const unapprovedReviews = await Review.find({ 
        service: service._id,
        isApproved: false
      });
      
      const hasIssue = 
        service.reviewCount !== approvedReviews.length || 
        service.totalReviews !== approvedReviews.length;
      
      if (hasIssue || allReviews.length > 0) {
        console.log(`\n📋 Service: ${service.name}`);
        console.log(`   ID: ${service._id}`);
        console.log(`\n   DATABASE VALUES:`);
        console.log(`   ├─ service.reviewCount: ${service.reviewCount}`);
        console.log(`   └─ service.totalReviews: ${service.totalReviews}`);
        console.log(`\n   ACTUAL COUNTS:`);
        console.log(`   ├─ Total reviews: ${allReviews.length}`);
        console.log(`   ├─ Approved reviews: ${approvedReviews.length}`);
        console.log(`   ├─ Spam reviews: ${spamReviews.length}`);
        console.log(`   └─ Unapproved reviews: ${unapprovedReviews.length}`);
        
        if (hasIssue) {
          console.log(`\n   ❌ ISSUE FOUND!`);
          console.log(`   Expected: ${approvedReviews.length}`);
          console.log(`   Got: reviewCount=${service.reviewCount}, totalReviews=${service.totalReviews}`);
          issuesFound++;
        } else {
          console.log(`\n   ✅ Counts are correct`);
        }
        
        // Show review details
        if (allReviews.length > 0) {
          console.log(`\n   REVIEW DETAILS:`);
          allReviews.forEach((review, index) => {
            const status = review.isSpamDetected ? '🚫 SPAM' : 
                          !review.isApproved ? '⏳ PENDING' : 
                          '✅ APPROVED';
            console.log(`   ${index + 1}. ${status} - Rating: ${review.rating}/5`);
          });
        }
        
        console.log('\n' + '-'.repeat(60));
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total services: ${services.length}`);
    console.log(`   Services with issues: ${issuesFound}`);
    
    if (issuesFound > 0) {
      console.log(`\n⚠️  ${issuesFound} service(s) have incorrect review counts!`);
      console.log(`\n💡 TO FIX: Run this command:`);
      console.log(`   node fixAllReviewCounts.js\n`);
    } else {
      console.log(`\n✅ All review counts are correct!\n`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

diagnoseReviewCount();
