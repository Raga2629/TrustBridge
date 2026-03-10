# 🧪 Complete Testing Guide for AI Systems

## Quick Start - Choose Your Testing Method

---

## ✅ METHOD 1: Standalone Tests (EASIEST - No Server Required)

### Test 1: Review Spam Detection

```bash
cd trustbridge-backend
node utils/reviewAnalysisAPI.js
```

**Expected Output:**
```
================================================================================
TRUSTBRIDGE REVIEW ANALYSIS - PROMPT FORMAT
================================================================================

Example 1: Genuine Review
--------------------------------------------------------------------------------
INPUT:
Review Text: "I stayed here for 2 months during my relocation..."
Rating Given: 4 stars
...

OUTPUT (STRICT JSON):
{
  "classification": "Genuine",
  "confidence_score": "85%",
  "risk_level": "Low",
  "trust_score_adjustment": "Increase"
}
```

### Test 2: Document Verification

```bash
cd trustbridge-backend
node utils/documentVerificationAPI.js
```

**Expected Output:**
```
================================================================================
TRUSTBRIDGE DOCUMENT VERIFICATION - PROMPT FORMAT
================================================================================

Example 1: Perfect Match (Verified)
--------------------------------------------------------------------------------
FORM DETAILS (User Entered):
Business Name: Sunrise Accommodation Services
...

OUTPUT (STRICT JSON):
{
  "verification_status": "Verified",
  "confidence_score": "100%",
  "risk_level": "Low",
  "recommended_action": "Approve"
}
```

### Test 3: Full Review Test Suite (8 Scenarios)

```bash
cd trustbridge-backend
node testReviewAnalysis.js
```

**Expected Output:**
- 8 different review scenarios tested
- Genuine, suspicious, and fake classifications
- Detailed analysis for each

---

## ✅ METHOD 2: API Testing with Postman/Thunder Client

### Step 1: Start Your Server

```bash
cd trustbridge-backend
npm start
```

### Step 2: Test Review Analysis API

**Endpoint:** `POST http://localhost:5000/api/review-analysis/analyze`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body:**
```json
{
  "reviewText": "I stayed here for 3 months. The apartment was clean and spacious. The owner was very helpful. Would recommend for newcomers.",
  "rating": 4,
  "propertyId": "any_property_id",
  "userId": "your_user_id"
}
```

**Expected Response:**
```json
{
  "success": true,
  "analysis": {
    "classification": "Genuine",
    "confidence_score": "85%",
    "risk_level": "Low",
    "detailed_reasoning": "This review appears genuine...",
    "trust_score_adjustment": "Increase",
    "flags": []
  }
}
```

### Step 3: Test Document Verification API

**Endpoint:** `POST http://localhost:5000/api/document-verification/verify`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body:**
```json
{
  "formBusinessName": "Sunrise Accommodation Services",
  "formOwnerName": "Rajesh Kumar",
  "formAddress": "123 MG Road, Bachupally, Hyderabad",
  "formPhone": "+91-9876543210",
  "formRegNo": "GST29ABCDE1234F1Z5",
  "ocrExtractedText": "GOODS AND SERVICES TAX REGISTRATION CERTIFICATE\n\nBusiness Name: Sunrise Accommodation Services\nProprietor: Rajesh Kumar\nBusiness Address: 123 MG Road, Bachupally, Hyderabad\nGSTIN: GST29ABCDE1234F1Z5\nContact: +91-9876543210",
  "providerId": "optional_provider_id"
}
```

**Expected Response:**
```json
{
  "success": true,
  "verification": {
    "verification_status": "Verified",
    "confidence_score": "100%",
    "risk_level": "Low",
    "mismatch_fields": [],
    "fraud_probability": "Low",
    "explanation": "All provided information matches...",
    "recommended_action": "Approve"
  }
}
```

---

## ✅ METHOD 3: Create Test Scripts

### Create Review Test Script

Create `trustbridge-backend/testReviewAPI.js`:

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/review-analysis/analyze';
const TOKEN = 'YOUR_TOKEN_HERE'; // Get from login

const testCases = [
  {
    name: 'Genuine Review',
    data: {
      reviewText: 'I stayed here for 3 months during my relocation. The apartment was clean, well-maintained, and the landlord was very responsive. The location is convenient with good access to markets and public transport. Rent was reasonable at 15000 per month. Would recommend for newcomers to the area.',
      rating: 4,
      propertyId: 'test_property_1',
      userId: 'test_user_1'
    }
  },
  {
    name: 'Fake Review',
    data: {
      reviewText: 'Best place ever!!! 100% satisfied!!! Must try!!!',
      rating: 5,
      propertyId: 'test_property_1',
      userId: 'test_user_2'
    }
  }
];

async function runTests() {
  console.log('Testing Review Analysis API...\n');

  for (const test of testCases) {
    console.log(`\nTest: ${test.name}`);
    console.log('-'.repeat(50));

    try {
      const response = await axios.post(API_URL, test.data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        }
      });

      console.log('Result:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }
  }
}

runTests();
```

Run with:
```bash
node testReviewAPI.js
```

### Create Document Verification Test Script

Create `trustbridge-backend/testDocumentAPI.js`:

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/document-verification/verify';
const TOKEN = 'YOUR_TOKEN_HERE';

const testCases = [
  {
    name: 'Perfect Match',
    data: {
      formBusinessName: 'Sunrise Accommodation Services',
      formOwnerName: 'Rajesh Kumar',
      formAddress: '123 MG Road, Bachupally, Hyderabad',
      formPhone: '+91-9876543210',
      formRegNo: 'GST29ABCDE1234F1Z5',
      ocrExtractedText: `
        GOODS AND SERVICES TAX REGISTRATION CERTIFICATE
        
        Business Name: Sunrise Accommodation Services
        Proprietor: Rajesh Kumar
        Business Address: 123 MG Road, Bachupally, Hyderabad
        GSTIN: GST29ABCDE1234F1Z5
        Contact: +91-9876543210
      `
    }
  },
  {
    name: 'Suspicious Document',
    data: {
      formBusinessName: 'Premium Stays',
      formOwnerName: 'John Doe',
      formAddress: '100 Main Street',
      formPhone: '1234567890',
      formRegNo: 'ABC123',
      ocrExtractedText: 'SAMPLE CERTIFICATE - DO NOT USE\n\nThis is a template document'
    }
  }
];

async function runTests() {
  console.log('Testing Document Verification API...\n');

  for (const test of testCases) {
    console.log(`\nTest: ${test.name}`);
    console.log('-'.repeat(50));

    try {
      const response = await axios.post(API_URL, test.data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        }
      });

      console.log('Result:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }
  }
}

runTests();
```

---

## ✅ METHOD 4: Frontend Integration Test

### Test in Browser Console

1. Open your TrustBridge frontend
2. Open browser console (F12)
3. Run this code:

```javascript
// Test Review Analysis
async function testReviewAnalysis() {
  const response = await fetch('http://localhost:5000/api/review-analysis/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      reviewText: 'Great place to stay! Clean and comfortable.',
      rating: 5,
      propertyId: 'test123',
      userId: 'user123'
    })
  });
  
  const data = await response.json();
  console.log('Review Analysis Result:', data);
}

testReviewAnalysis();
```

```javascript
// Test Document Verification
async function testDocumentVerification() {
  const response = await fetch('http://localhost:5000/api/document-verification/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      formBusinessName: 'Test Business',
      formOwnerName: 'Test Owner',
      formAddress: '123 Test Street',
      formPhone: '9876543210',
      formRegNo: 'TEST123',
      ocrExtractedText: 'Business License\nBusiness: Test Business\nOwner: Test Owner\nAddress: 123 Test Street\nLicense: TEST123\nPhone: 9876543210'
    })
  });
  
  const data = await response.json();
  console.log('Document Verification Result:', data);
}

testDocumentVerification();
```

---

## 📊 What to Look For in Test Results

### Review Spam Detection

✅ **Genuine Review Should Show:**
- Classification: "Genuine"
- Confidence: 70-95%
- Risk Level: "Low"
- Trust Score: "Increase"
- Few or no flags

✅ **Fake Review Should Show:**
- Classification: "Fake"
- Confidence: 60-95%
- Risk Level: "High"
- Trust Score: "Decrease"
- Multiple flags (promotional language, too short, etc.)

### Document Verification

✅ **Verified Document Should Show:**
- Status: "Verified"
- Confidence: 90-100%
- Risk Level: "Low"
- Mismatch Fields: []
- Fraud Probability: "Low"
- Action: "Approve"

✅ **Suspicious Document Should Show:**
- Status: "Suspicious" or "Rejected"
- Confidence: 0-50%
- Risk Level: "High"
- Mismatch Fields: [list of fields]
- Fraud Probability: "High"
- Action: "Reject" or "Manual Review"

---

## 🐛 Troubleshooting

### Issue: "Cannot find module"
**Solution:**
```bash
cd trustbridge-backend
npm install
```

### Issue: "Authorization required"
**Solution:** 
- For standalone tests: No auth needed
- For API tests: Get token by logging in first

### Issue: Server not starting
**Solution:**
```bash
# Check if MongoDB is running
# Check .env file has correct settings
# Check port 5000 is not in use
```

### Issue: Tests pass but API fails
**Solution:**
- Check routes are added to server.js
- Restart server after adding routes
- Check authentication middleware

---

## 🎯 Quick Command Reference

```bash
# Standalone Tests (No server needed)
node utils/reviewAnalysisAPI.js
node utils/documentVerificationAPI.js
node testReviewAnalysis.js

# Start Server
npm start

# Test with curl (Review)
curl -X POST http://localhost:5000/api/review-analysis/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"reviewText":"Great place!","rating":5,"propertyId":"test","userId":"user1"}'

# Test with curl (Document)
curl -X POST http://localhost:5000/api/document-verification/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"formBusinessName":"Test","formOwnerName":"Owner","ocrExtractedText":"Business: Test, Owner: Owner"}'
```

---

## ✅ Success Checklist

- [ ] Standalone review test runs successfully
- [ ] Standalone document test runs successfully
- [ ] Full review test suite passes (8 tests)
- [ ] Server starts without errors
- [ ] Review API endpoint responds
- [ ] Document verification API endpoint responds
- [ ] Genuine reviews classified correctly
- [ ] Fake reviews detected
- [ ] Perfect document matches verified
- [ ] Suspicious documents rejected

---

## 📝 Next Steps After Testing

1. ✅ Verify all tests pass
2. ⬜ Integrate with frontend forms
3. ⬜ Add OCR service integration
4. ⬜ Build admin review panels
5. ⬜ Set up monitoring and logging
6. ⬜ Deploy to production

---

**Need Help?** Check the detailed guides:
- `REVIEW_SPAM_DETECTION_GUIDE.md`
- `DOCUMENT_VERIFICATION_GUIDE.md`
- `REVIEW_SPAM_DETECTION_COMPLETE.md`
- `DOCUMENT_VERIFICATION_COMPLETE.md`
