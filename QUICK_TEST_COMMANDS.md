# ⚡ Quick Test Commands - AI Systems

## 🎯 ONE COMMAND TO TEST EVERYTHING

```bash
cd trustbridge-backend
node testAllAI.js
```

**This tests:**
- ✅ Review Spam Detection (3 scenarios)
- ✅ Document Verification (3 scenarios)
- ✅ Shows pass/fail for each test
- ✅ Displays detailed results

---

## 📝 Individual System Tests

### Test Review Spam Detection Only

```bash
# Simple format (matches your prompt)
node utils/reviewAnalysisAPI.js

# Full test suite (8 scenarios)
node testReviewAnalysis.js
```

### Test Document Verification Only

```bash
# Simple format (matches your prompt)
node utils/documentVerificationAPI.js
```

---

## 🚀 Test with Server Running

### 1. Start Server
```bash
npm start
```

### 2. Test Review API (Postman/Thunder Client)
```
POST http://localhost:5000/api/review-analysis/analyze
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "reviewText": "Great place!",
  "rating": 5,
  "propertyId": "test",
  "userId": "user1"
}
```

### 3. Test Document API
```
POST http://localhost:5000/api/document-verification/verify
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "formBusinessName": "Test Business",
  "formOwnerName": "Owner Name",
  "ocrExtractedText": "Business: Test Business, Owner: Owner Name"
}
```

---

## ✅ Expected Results

### All Tests Should Show:
```
📊 TEST SUMMARY
📝 Review Spam Detection: 3/3 passed
📄 Document Verification: 3/3 passed
🎯 Overall: 6/6 tests passed
✅ ALL TESTS PASSED!
```

---

## 🐛 If Tests Fail

```bash
# Install dependencies
npm install

# Check Node version (should be 14+)
node --version

# Run tests again
node testAllAI.js
```

---

## 📚 Full Documentation

- `AI_SYSTEMS_TESTING_GUIDE.md` - Complete testing guide
- `REVIEW_SPAM_DETECTION_COMPLETE.md` - Review system docs
- `DOCUMENT_VERIFICATION_COMPLETE.md` - Document system docs

---

## 🎉 Quick Status Check

Run this to verify everything is working:

```bash
cd trustbridge-backend && node testAllAI.js
```

If you see "✅ ALL TESTS PASSED!" - you're good to go! 🚀
