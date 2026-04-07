/**
 * Seed Test Data for OCR Verification Testing
 * Creates a sample provider with mock OCR data
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

const User = require('./models/User');
const ServiceProvider = require('./models/ServiceProvider');

async function seedTestData() {
  console.log('\n🌱 SEEDING TEST VERIFICATION DATA\n');
  console.log('='.repeat(80));

  try {
    // Create test user
    console.log('\n1️⃣ Creating test user...');
    
    let testUser = await User.findOne({ email: 'testprovider@test.com' });
    
    if (!testUser) {
      testUser = await User.create({
        name: 'Rajesh Kumar',
        email: 'testprovider@test.com',
        password: 'test123',
        phone: '9876543210',
        role: 'PROVIDER',
        city: 'Hyderabad',
        area: 'Bachupally'
      });
      console.log('   ✅ Test user created');
    } else {
      console.log('   ℹ️  Test user already exists');
    }

    // Create test provider with mock OCR data
    console.log('\n2️⃣ Creating test provider with OCR data...');
    
    let testProvider = await ServiceProvider.findOne({ user: testUser._id });
    
    if (!testProvider) {
      testProvider = await ServiceProvider.create({
        user: testUser._id,
        businessName: 'Sunrise Accommodation Services',
        ownerName: 'Rajesh Kumar',
        category: 'Rentals',
        businessAddress: '123 MG Road, Bachupally, Hyderabad',
        city: 'Hyderabad',
        area: 'Bachupally',
        phone: '9876543210',
        email: 'testprovider@test.com',
        ownerIdProof: 'uploads/test-aadhaar.jpg',
        businessProof: 'uploads/test-gst.jpg',
        businessAddressProof: 'uploads/test-address.jpg',
        verificationStatus: 'PENDING',
        verificationScore: 85,
        ocrData: {
          aadhaarExtracted: {
            name: 'Rajesh Kumar',
            aadhaarNumber: '123456789012',
            address: '123 MG Road, Bachupally, Hyderabad'
          },
          businessExtracted: {
            businessName: 'Sunrise Accommodation Services',
            gstNumber: '29ABCDE1234F1Z5',
            registrationNumber: 'REG123456',
            address: '123 MG Road, Bachupally, Hyderabad',
            phone: '+91-9876543210'
          },
          aadhaarText: `GOVERNMENT OF INDIA
UNIQUE IDENTIFICATION AUTHORITY OF INDIA

Name: Rajesh Kumar
Aadhaar Number: 1234 5678 9012
Address: 123 MG Road, Bachupally, Hyderabad
DOB: 01/01/1990`,
          businessText: `GOODS AND SERVICES TAX REGISTRATION CERTIFICATE

Business Name: Sunrise Accommodation Services
Proprietor: Rajesh Kumar
Business Address: 123 MG Road, Bachupally, Hyderabad
GSTIN: 29ABCDE1234F1Z5
Contact: +91-9876543210
Date of Registration: 01/01/2020`,
          extractedAt: new Date()
        },
        verificationDetails: {
          aadhaarVerification: {
            verification_status: 'Verified',
            confidence_score: '95%',
            risk_level: 'Low',
            mismatch_fields: [],
            explanation: 'All fields match successfully'
          },
          businessVerification: {
            verification_status: 'Verified',
            confidence_score: '100%',
            risk_level: 'Low',
            mismatch_fields: [],
            explanation: 'Perfect match on all fields'
          },
          aadhaarValid: true,
          gstValid: true
        }
      });
      console.log('   ✅ Test provider created with OCR data');
    } else {
      console.log('   ℹ️  Test provider already exists');
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ TEST DATA SEEDED SUCCESSFULLY!\n');
    console.log('📋 Test Provider Details:');
    console.log(`   ID: ${testProvider._id}`);
    console.log(`   Business: ${testProvider.businessName}`);
    console.log(`   Owner: ${testProvider.ownerName}`);
    console.log(`   Status: ${testProvider.verificationStatus}`);
    console.log(`   Score: ${testProvider.verificationScore}/100`);
    
    console.log('\n🌐 TEST URL:');
    console.log(`   http://localhost:5173/admin/verification/provider/${testProvider._id}`);
    
    console.log('\n📝 Login Credentials:');
    console.log('   Admin:');
    console.log('   - Email: admin@trustbridge.com');
    console.log('   - Password: admin123');
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Make sure servers are running:');
    console.log('   - Backend: npm start (in trustbridge-backend)');
    console.log('   - Frontend: npm run dev (in trustbridge-v2)');
    console.log('2. Login as admin at: http://localhost:5173/admin/login');
    console.log('3. Copy the test URL above and paste in browser');
    console.log('4. You should see the OCR verification page with data!');
    
    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed\n');
  }
}

seedTestData();
