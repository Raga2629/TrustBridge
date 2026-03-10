/**
 * Test script for Review Spam Detection System
 * Run with: node testReviewAnalysis.js
 */

const ReviewSpamDetector = require('./utils/reviewSpamDetector');

console.log('='.repeat(80));
console.log('TRUSTBRIDGE REVIEW SPAM DETECTION SYSTEM - TEST SUITE');
console.log('='.repeat(80));
console.log();

const detector = new ReviewSpamDetector();

// Test cases
const testCases = [
  {
    name: 'TEST 1: Genuine Review',
    data: {
      reviewText: 'I stayed here for 3 months while relocating to Bachupally. The apartment was clean and spacious. The owner was very helpful with local information. The location is convenient with good access to public transport. Would recommend for newcomers.',
      rating: 4,
      accountAgeDays: 45,
      totalReviews: 3,
      reviewsToday: 1,
      similarReviews: []
    }
  },
  {
    name: 'TEST 2: Suspicious - Too Generic',
    data: {
      reviewText: 'Very good place. Amazing service. Highly recommend!',
      rating: 5,
      accountAgeDays: 2,
      totalReviews: 8,
      reviewsToday: 3,
      similarReviews: []
    }
  },
  {
    name: 'TEST 3: Fake - Promotional Language',
    data: {
      reviewText: 'Best place ever!!! 100% satisfied!!! Must try!!! Call now for booking!!! Amazing amazing amazing!!!',
      rating: 5,
      accountAgeDays: 1,
      totalReviews: 15,
      reviewsToday: 5,
      similarReviews: []
    }
  },
  {
    name: 'TEST 4: Suspicious - Too Short',
    data: {
      reviewText: 'Good place',
      rating: 5,
      accountAgeDays: 30,
      totalReviews: 2,
      reviewsToday: 1,
      similarReviews: []
    }
  },
  {
    name: 'TEST 5: Fake - Similar to Others',
    data: {
      reviewText: 'Great location with excellent amenities. Very clean and comfortable. Highly recommended for everyone.',
      rating: 5,
      accountAgeDays: 3,
      totalReviews: 12,
      reviewsToday: 4,
      similarReviews: [
        'Great location with excellent amenities. Very clean and comfortable. Highly recommended.',
        'Excellent location with great amenities. Clean and comfortable. Highly recommended for all.'
      ]
    }
  },
  {
    name: 'TEST 6: Genuine - Detailed Negative Review',
    data: {
      reviewText: 'I had some issues during my 2-week stay. The room was smaller than advertised and the water heater stopped working after 3 days. The landlord took 5 days to fix it. Location is good but maintenance needs improvement. Not recommended for long stays.',
      rating: 2,
      accountAgeDays: 120,
      totalReviews: 5,
      reviewsToday: 1,
      similarReviews: []
    }
  },
  {
    name: 'TEST 7: Suspicious - Excessive Emojis',
    data: {
      reviewText: 'Amazing place 😍😍😍 Best ever 🎉🎉🎉 Super clean 🌟🌟🌟 Love it ❤️❤️❤️',
      rating: 5,
      accountAgeDays: 5,
      totalReviews: 10,
      reviewsToday: 2,
      similarReviews: []
    }
  },
  {
    name: 'TEST 8: Genuine - Balanced Review',
    data: {
      reviewText: 'Stayed for 6 months during my job relocation. The flat is in a good neighborhood with markets nearby. Rent was reasonable at 12000 per month. Some minor issues with plumbing but the owner was responsive. Overall a decent experience for the price.',
      rating: 4,
      accountAgeDays: 200,
      totalReviews: 4,
      reviewsToday: 1,
      similarReviews: []
    }
  }
];

// Run tests
testCases.forEach((testCase, index) => {
  console.log(`\n${testCase.name}`);
  console.log('-'.repeat(80));
  console.log(`Review: "${testCase.data.reviewText}"`);
  console.log(`Rating: ${testCase.data.rating} stars`);
  console.log(`Account Age: ${testCase.data.accountAgeDays} days`);
  console.log(`Total Reviews: ${testCase.data.totalReviews}`);
  console.log(`Reviews Today: ${testCase.data.reviewsToday}`);
  console.log();

  const result = detector.analyzeReview(testCase.data);
  
  console.log('ANALYSIS RESULT:');
  console.log(JSON.stringify(result, null, 2));
  console.log();
});

console.log('='.repeat(80));
console.log('TEST SUITE COMPLETE');
console.log('='.repeat(80));
