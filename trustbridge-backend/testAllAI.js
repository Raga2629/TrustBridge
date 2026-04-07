/**
 * Complete AI Systems Test Runner
 * Tests both Review Spam Detection and Document Verification
 * Run with: node testAllAI.js
 */

console.log('\n' + '='.repeat(80));
console.log('🤖 TRUSTBRIDGE AI SYSTEMS - COMPLETE TEST SUITE');
console.log('='.repeat(80));
console.log('\nTesting both Review Spam Detection and Document Verification systems...\n');

// Test 1: Review Spam Detection
console.log('\n' + '█'.repeat(80));
console.log('TEST 1: REVIEW SPAM DETECTION SYSTEM');
console.log('█'.repeat(80) + '\n');

const ReviewSpamDetector = require('./utils/reviewSpamDetector');
const reviewDetector = new ReviewSpamDetector();

const reviewTests = [
  {
    name: '✅ Genuine Review',
    data: {
      reviewText: 'I stayed here for 3 months during my relocation. The apartment was clean, well-maintained, and the landlord was very responsive. The location is convenient with good access to markets and public transport. Rent was reasonable at 15000 per month. Would recommend for newcomers to the area.',
      rating: 4,
      accountAgeDays: 60,
      totalReviews: 3,
      reviewsToday: 1,
      similarReviews: []
    },
    expected: 'Genuine'
  },
  {
    name: '⚠️ Suspicious Review',
    data: {
      reviewText: 'Very good place. Amazing service.',
      rating: 5,
      accountAgeDays: 2,
      totalReviews: 10,
      reviewsToday: 4,
      similarReviews: []
    },
    expected: 'Suspicious/Fake'
  },
  {
    name: '❌ Fake Review',
    data: {
      reviewText: 'Best place ever!!! 100% satisfied!!! Must try!!! Call now!!!',
      rating: 5,
      accountAgeDays: 1,
      totalReviews: 20,
      reviewsToday: 8,
      similarReviews: []
    },
    expected: 'Fake'
  }
];

let reviewsPassed = 0;
let reviewsFailed = 0;

reviewTests.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}`);
  console.log('-'.repeat(70));
  console.log(`Input: "${test.data.reviewText.substring(0, 60)}..."`);
  console.log(`Rating: ${test.data.rating} stars | Account Age: ${test.data.accountAgeDays} days`);
  
  const result = reviewDetector.analyzeReview(test.data);
  
  console.log(`\nResult: ${result.classification}`);
  console.log(`Confidence: ${result.confidence_score}`);
  console.log(`Risk Level: ${result.risk_level}`);
  console.log(`Trust Score: ${result.trust_score_adjustment}`);
  
  const passed = result.classification === test.expected || 
                 (test.expected === 'Suspicious/Fake' && 
                  (result.classification === 'Suspicious' || result.classification === 'Fake'));
  
  if (passed) {
    console.log('✅ TEST PASSED');
    reviewsPassed++;
  } else {
    console.log(`❌ TEST FAILED (Expected: ${test.expected})`);
    reviewsFailed++;
  }
});

// Test 2: Document Verification
console.log('\n\n' + '█'.repeat(80));
console.log('TEST 2: DOCUMENT VERIFICATION SYSTEM');
console.log('█'.repeat(80) + '\n');

const DocumentVerifier = require('./utils/documentVerifier');
const docVerifier = new DocumentVerifier();

const documentTests = [
  {
    name: '✅ Perfect Match',
    formData: {
      FORM_BUSINESS_NAME: 'Sunrise Accommodation Services',
      FORM_OWNER_NAME: 'Rajesh Kumar',
      FORM_ADDRESS: '123 MG Road, Bachupally, Hyderabad',
      FORM_PHONE: '+91-9876543210',
      FORM_REG_NO: 'GST29ABCDE1234F1Z5'
    },
    ocrText: `
      GOODS AND SERVICES TAX REGISTRATION CERTIFICATE
      Business Name: Sunrise Accommodation Services
      Proprietor: Rajesh Kumar
      Business Address: 123 MG Road, Bachupally, Hyderabad
      GSTIN: GST29ABCDE1234F1Z5
      Contact: +91-9876543210
    `,
    expected: 'Verified'
  },
  {
    name: '⚠️ Partial Match',
    formData: {
      FORM_BUSINESS_NAME: 'Green Valley Homestay',
      FORM_OWNER_NAME: 'Priya Sharma',
      FORM_ADDRESS: '45 Park Street, Miyapur',
      FORM_PHONE: '9988776655',
      FORM_REG_NO: 'REG2024001234'
    },
    ocrText: `
      TRADE LICENSE
      Business: Green Valley Home Stay
      Owner: P. Sharma
      Location: 45 Park St, Miyapur
      License No: REG2024001234
    `,
    expected: 'Partially Matched'
  },
  {
    name: '❌ Suspicious Document',
    formData: {
      FORM_BUSINESS_NAME: 'Premium Stays',
      FORM_OWNER_NAME: 'John Doe',
      FORM_ADDRESS: '100 Main Street',
      FORM_PHONE: '1234567890',
      FORM_REG_NO: 'ABC123'
    },
    ocrText: 'SAMPLE CERTIFICATE - DO NOT USE\n\nThis is a template document\n\nWATERMARK: SAMPLE ONLY',
    expected: 'Rejected'
  }
];

let docsPassed = 0;
let docsFailed = 0;

documentTests.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}`);
  console.log('-'.repeat(70));
  console.log(`Business: ${test.formData.FORM_BUSINESS_NAME}`);
  console.log(`Owner: ${test.formData.FORM_OWNER_NAME}`);
  console.log(`Reg No: ${test.formData.FORM_REG_NO}`);
  
  const result = docVerifier.verifyDocument(test.formData, test.ocrText);
  
  console.log(`\nResult: ${result.verification_status}`);
  console.log(`Confidence: ${result.confidence_score}`);
  console.log(`Risk Level: ${result.risk_level}`);
  console.log(`Fraud Probability: ${result.fraud_probability}`);
  console.log(`Action: ${result.recommended_action}`);
  
  if (result.mismatch_fields.length > 0) {
    console.log(`Mismatches: ${result.mismatch_fields.join(', ')}`);
  }
  
  const passed = result.verification_status === test.expected;
  
  if (passed) {
    console.log('✅ TEST PASSED');
    docsPassed++;
  } else {
    console.log(`❌ TEST FAILED (Expected: ${test.expected})`);
    docsFailed++;
  }
});

// Summary
console.log('\n\n' + '='.repeat(80));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(80));

const totalTests = reviewTests.length + documentTests.length;
const totalPassed = reviewsPassed + docsPassed;
const totalFailed = reviewsFailed + docsFailed;

console.log(`\n📝 Review Spam Detection: ${reviewsPassed}/${reviewTests.length} passed`);
console.log(`📄 Document Verification: ${docsPassed}/${documentTests.length} passed`);
console.log(`\n🎯 Overall: ${totalPassed}/${totalTests} tests passed`);

if (totalFailed === 0) {
  console.log('\n✅ ALL TESTS PASSED! Systems are working correctly.');
} else {
  console.log(`\n⚠️ ${totalFailed} test(s) failed. Please review the results above.`);
}

console.log('\n' + '='.repeat(80));
console.log('🎉 Testing Complete!');
console.log('='.repeat(80) + '\n');

// Exit with appropriate code
process.exit(totalFailed === 0 ? 0 : 1);
