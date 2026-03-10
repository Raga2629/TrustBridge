/**
 * Test script for Hybrid ML Review Detection System
 * Tests the complete flow: Rule-based + ML + Classification
 */

const axios = require('axios');
const colors = require('colors');

const BACKEND_URL = 'http://localhost:5000';
const ML_SERVICE_URL = 'http://localhost:5001';

// Test data
let authToken = '';
let serviceId = '';

const testReviews = {
  genuine: [
    {
      rating: 4,
      comment: "I visited this clinic last week for a routine checkup. The doctor was professional and took time to explain everything. The waiting time was about 20 minutes which was reasonable. The clinic was clean and well-maintained. Overall a good experience."
    },
    {
      rating: 5,
      comment: "We rented an apartment through this service for 6 months. The owner was responsive and fixed issues promptly. The location was convenient near the metro station. The rent was fair for the area. Would recommend to others looking for accommodation."
    }
  ],
  suspicious: [
    {
      rating: 5,
      comment: "Very good service. Nice place. Excellent experience."
    },
    {
      rating: 5,
      comment: "Great! Highly recommend. Best service."
    }
  ],
  fake: [
    {
      rating: 5,
      comment: "Best service ever!!! Amazing!!! Must try!!! Call now!!! 100% satisfied!!! Highly recommend!!! Perfect place!!! Awesome!!!"
    },
    {
      rating: 5,
      comment: "😍😍😍 Amazing service 😍😍😍 Best ever 😍😍😍 Must try 😍😍😍 Perfect 😍😍😍"
    }
  ]
};

function printHeader(text) {
  console.log('\n' + '='.repeat(60).cyan);
  console.log(text.cyan.bold);
  console.log('='.repeat(60).cyan + '\n');
}

function printResult(type, review, response) {
  console.log(`\n${'Review Type:'.yellow} ${type.toUpperCase()}`);
  console.log(`${'Rating:'.yellow} ${review.rating}`);
  console.log(`${'Comment:'.yellow} ${review.comment.substring(0, 80)}...`);
  
  if (response.blocked) {
    console.log(`${'Status:'.red} BLOCKED ❌`);
    console.log(`${'Reason:'.red} ${response.message}`);
  } else if (response.needsApproval) {
    console.log(`${'Status:'.yellow} SUSPICIOUS ⚠️`);
    console.log(`${'Message:'.yellow} ${response.message}`);
  } else {
    console.log(`${'Status:'.green} APPROVED ✅`);
    console.log(`${'Message:'.green} Review posted successfully`);
  }
  
  if (response.finalRiskScore !== undefined) {
    console.log(`${'Final Risk Score:'.cyan} ${response.finalRiskScore}`);
    console.log(`${'Rule-Based Score:'.cyan} ${response.ruleBasedScore || 'N/A'}`);
    console.log(`${'ML Score:'.cyan} ${response.mlScore || 'N/A'}`);
  }
}

async function testMLService() {
  printHeader('TEST 1: ML Service Health Check');
  
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 2000 });
    console.log('✅ ML Service is healthy!'.green);
    console.log(`   Model Type: ${response.data.model_type}`.green);
    console.log(`   Features: ${response.data.features}`.green);
    return true;
  } catch (error) {
    console.log('❌ ML Service is not available!'.red);
    console.log('   Make sure to start the ML service:'.yellow);
    console.log('   cd trustbridge-backend/ml'.yellow);
    console.log('   python predict_service.py'.yellow);
    return false;
  }
}

async function login() {
  printHeader('TEST 2: User Login');
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'user@example.com',
      password: 'password123'
    });
    
    authToken = response.data.token;
    console.log('✅ Login successful!'.green);
    console.log(`   Token: ${authToken.substring(0, 20)}...`.green);
    return true;
  } catch (error) {
    console.log('❌ Login failed!'.red);
    console.log(`   Error: ${error.response?.data?.message || error.message}`.red);
    console.log('\n   Please ensure:'.yellow);
    console.log('   1. Backend is running (node server.js)'.yellow);
    console.log('   2. User exists (email: user@example.com, password: password123)'.yellow);
    return false;
  }
}

async function getFirstService() {
  printHeader('TEST 3: Get Service ID');
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/services?location=Bachupally`);
    
    if (response.data.length === 0) {
      console.log('❌ No services found!'.red);
      console.log('   Please seed services first:'.yellow);
      console.log('   node seedBachupallyServices.js'.yellow);
      return false;
    }
    
    serviceId = response.data[0]._id;
    console.log('✅ Service found!'.green);
    console.log(`   Service: ${response.data[0].name}`.green);
    console.log(`   ID: ${serviceId}`.green);
    return true;
  } catch (error) {
    console.log('❌ Failed to get services!'.red);
    console.log(`   Error: ${error.message}`.red);
    return false;
  }
}

async function testReview(type, review) {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/reviews`,
      {
        serviceId,
        rating: review.rating,
        comment: review.comment
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    printResult(type, review, response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      printResult(type, review, error.response.data);
      return error.response.data;
    } else {
      console.log(`❌ Request failed: ${error.message}`.red);
      return null;
    }
  }
}

async function testGenuineReviews() {
  printHeader('TEST 4: Genuine Reviews (Should be Auto-Approved)');
  
  for (const review of testReviews.genuine) {
    await testReview('genuine', review);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between requests
  }
}

async function testSuspiciousReviews() {
  printHeader('TEST 5: Suspicious Reviews (Should be Flagged for Admin Review)');
  
  for (const review of testReviews.suspicious) {
    await testReview('suspicious', review);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testFakeReviews() {
  printHeader('TEST 6: Fake Reviews (Should be Blocked)');
  
  for (const review of testReviews.fake) {
    await testReview('fake', review);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testAdminEndpoints() {
  printHeader('TEST 7: Admin Endpoints');
  
  console.log('Testing admin endpoints requires admin authentication.'.yellow);
  console.log('To test admin features:'.yellow);
  console.log('1. Login as admin: POST /api/admin/login'.yellow);
  console.log('2. Get suspicious reviews: GET /api/admin/reviews/suspicious'.yellow);
  console.log('3. Approve review: PUT /api/admin/reviews/:id/approve'.yellow);
  console.log('4. Reject review: PUT /api/admin/reviews/:id/reject'.yellow);
  console.log('5. Get stats: GET /api/admin/reviews/stats'.yellow);
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗'.magenta);
  console.log('║     Hybrid ML Review Detection - Integration Test         ║'.magenta);
  console.log('╚════════════════════════════════════════════════════════════╝'.magenta);
  
  // Test ML service
  const mlHealthy = await testMLService();
  if (!mlHealthy) {
    console.log('\n⚠️  ML service is not available. Tests will use rule-based detection only.'.yellow);
    console.log('For full hybrid detection, start the ML service first.\n'.yellow);
  }
  
  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication. Exiting...'.red);
    return;
  }
  
  // Get service
  const serviceFound = await getFirstService();
  if (!serviceFound) {
    console.log('\n❌ Cannot proceed without a service. Exiting...'.red);
    return;
  }
  
  // Test reviews
  await testGenuineReviews();
  await testSuspiciousReviews();
  await testFakeReviews();
  await testAdminEndpoints();
  
  // Summary
  printHeader('✅ Test Suite Complete!');
  console.log('Summary:'.cyan.bold);
  console.log('✅ Genuine reviews should be auto-approved (risk score < 30)'.green);
  console.log('⚠️  Suspicious reviews should be flagged for admin review (risk score 30-59)'.yellow);
  console.log('❌ Fake reviews should be blocked immediately (risk score >= 60)'.red);
  
  console.log('\nNext Steps:'.cyan.bold);
  console.log('1. Check MongoDB to verify reviews were saved correctly'.yellow);
  console.log('2. Test admin moderation endpoints'.yellow);
  console.log('3. Monitor review classification accuracy'.yellow);
  console.log('4. Adjust risk score thresholds if needed'.yellow);
}

// Run tests
main().catch(error => {
  console.log(`\n❌ Unexpected error: ${error.message}`.red);
  console.error(error);
});
