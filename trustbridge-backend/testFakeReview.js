/**
 * Quick test to verify AI spam detection is working
 * Run with: node testFakeReview.js
 */

const ReviewSpamDetector = require('./utils/reviewSpamDetector');

console.log('🧪 Testing Fake Review Detection\n');
console.log('='.repeat(60));

// Test the exact review from the screenshot
const fakeReview = {
  reviewText: 'Super college!!!! 😊😊😊😊😊❤',
  rating: 5,
  accountAgeDays: 30,
  totalReviews: 1,
  reviewsToday: 1,
  similarReviews: []
};

console.log('\nReview to test:');
console.log(`Text: "${fakeReview.reviewText}"`);
console.log(`Rating: ${fakeReview.rating} stars`);
console.log('\nAnalyzing...\n');

const detector = new ReviewSpamDetector();
const result = detector.analyzeReview(fakeReview);

console.log('='.repeat(60));
console.log('AI ANALYSIS RESULT:');
console.log('='.repeat(60));
console.log(`Classification: ${result.classification}`);
console.log(`Confidence: ${result.confidence_score}`);
console.log(`Risk Level: ${result.risk_level}`);
console.log(`Trust Score: ${result.trust_score_adjustment}`);
console.log('\nDetailed Reasoning:');
console.log(result.detailed_reasoning);
console.log('\nFlags Detected:');
result.flags.forEach(flag => console.log(`  - ${flag}`));
console.log('='.repeat(60));

if (result.classification === 'Fake') {
  console.log('\n✅ CORRECT: This review SHOULD be blocked');
  console.log('❌ If it was submitted, the server needs to be restarted');
} else {
  console.log('\n⚠️ WARNING: AI did not classify this as fake');
  console.log('This might need threshold adjustment');
}

console.log('\n' + '='.repeat(60));
console.log('To enable blocking, restart your backend server:');
console.log('1. Stop server (Ctrl + C)');
console.log('2. Run: npm start');
console.log('3. Try submitting the review again');
console.log('='.repeat(60) + '\n');
