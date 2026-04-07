# 👀 Visual Guide: How to Test OCR in Your App

## 🎬 Step-by-Step with Screenshots

---

## 📍 STEP 1: Install & Test Backend (Terminal)

### Open Terminal 1

```bash
cd trustbridge-backend
```

### Install Dependencies

```bash
npm install tesseract.js multer
```

**What you'll see:**
```
added 15 packages in 5s
```

### Create Upload Folder

```bash
mkdir -p uploads/verification-documents
```

**What you'll see:**
```
(No output - folder created silently)
```

### Run Test

```bash
node testOCRVerification.js
```

**What you'll see:**
```
🧪 TRUSTBRIDGE OCR VERIFICATION SYSTEM - TEST SUITE
================================================================================

📋 TEST 1: Aadhaar Format Validation
--------------------------------------------------------------------------------
1. "1234 5678 9012" → true ✅ PASS
2. "123456789012" → true ✅ PASS
3. "1234567890" → false ✅ PASS
4. "ABCD1234EFGH" → false ✅ PASS

📋 TEST 2: GST Format Validation
--------------------------------------------------------------------------------
1. "22AAAAA0000A1Z5" → true ✅ PASS
2. "29ABCDE1234F1Z5" → true ✅ PASS
3. "INVALID123" → false ✅ PASS
4. "22AAA" → false ✅ PASS

📋 TEST 3: Field Extraction from Sample Text
--------------------------------------------------------------------------------
Extracted Fields:
{
  "name": "Rajesh Kumar",
  "aadhaarNumber": "123456789012",
  "gstNumber": "29ABCDE1234F1Z5",
  "businessName": "Sunrise Accommodation Services",
  "address": "123 MG Road, Bachupally, Hyderabad",
  "phone": "+919876543210",
  "registrationNumber": null
}

📋 TEST 4: Document Verification
--------------------------------------------------------------------------------

Test Case 1: Perfect Match
----------------------------------------
Status: Verified
Confidence: 100%
Risk Level: Low
Recommended Action: Approve
Explanation: All provided information matches...
✅ PASS

Test Case 2: Name Mismatch
----------------------------------------
Status: Suspicious
Confidence: 40%
Risk Level: High
Recommended Action: Reject
Explanation: Significant discrepancies found...
✅ PASS

Test Case 3: Suspicious Document
----------------------------------------
Status: Rejected
Confidence: 0%
Risk Level: High
Recommended Action: Reject
Explanation: Document rejected due to suspicious patterns...
✅ PASS

================================================================================
📊 TEST SUMMARY
================================================================================
✅ Aadhaar validation: Working
✅ GST validation: Working
✅ Field extraction: Working
✅ Document verification: Working

🎉 All OCR verification components are functional!

Next Steps:
1. Install Tesseract.js: npm install tesseract.js ✅ (Already done)
2. Create uploads folder: mkdir -p uploads/verification-documents ✅ (Already done)
3. Add routes to server.js ✅ (Already done)
4. Test with real document images
```

**✅ If you see this, OCR backend is working!**

---

## 📍 STEP 2: Start Servers

### Terminal 1 - Backend

```bash
cd trustbridge-backend
npm start
```

**What you'll see:**
```
> trustbridge-backend@1.0.0 start
> node server.js

MongoDB Connected: localhost
Server running on port 5000
```

### Terminal 2 - Frontend

```bash
cd trustbridge-v2
npm run dev
```

**What you'll see:**
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**✅ Both servers running!**

---

## 📍 STEP 3: Test in Browser

### Open Browser

Navigate to: `http://localhost:5173`

**What you'll see:**
```
┌─────────────────────────────────────────┐
│  TrustBridge                            │
│  [Home] [Services] [Login] [Sign Up]   │
├─────────────────────────────────────────┤
│                                         │
│  Welcome to TrustBridge                 │
│  Your Trusted Local Services Platform  │
│                                         │
│  [Get Started]                          │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📍 STEP 4: Login as Admin

### Click "Login" → "Admin Login"

Navigate to: `http://localhost:5173/admin/login`

**What you'll see:**
```
┌─────────────────────────────────────────┐
│         Admin Login                     │
├─────────────────────────────────────────┤
│                                         │
│  Email:    [________________]           │
│  Password: [________________]           │
│                                         │
│  [Login]                                │
│                                         │
└─────────────────────────────────────────┘
```

### Enter Credentials

- Email: `admin@trustbridge.com`
- Password: `admin123`

### Click "Login"

**What you'll see:**
```
┌─────────────────────────────────────────┐
│  Admin Dashboard                        │
├─────────────────────────────────────────┤
│  Welcome, Admin!                        │
│                                         │
│  📊 Statistics                          │
│  • Total Users: 50                      │
│  • Total Services: 25                   │
│  • Pending Verifications: 5             │
│                                         │
│  [Manage Users]                         │
│  [Verify Services]                      │
│  [View Complaints]                      │
│                                         │
└─────────────────────────────────────────┘
```

**✅ Logged in as admin!**

---

## 📍 STEP 5: Access OCR Verification Page

### Method 1: Direct URL

Navigate to (replace with actual ID):
```
http://localhost:5173/admin/verification/provider/65abc123def456789
```

### Method 2: From Admin Dashboard

1. Click "Verify Services" or "Manage Users"
2. Find a pending provider/resident
3. Click "View Verification"

**What you'll see:**
```
┌─────────────────────────────────────────────────────────────┐
│  Service Provider Verification              [PENDING]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐                                          │
│  │              │   Status: PENDING                         │
│  │      85      │   Verified: No                            │
│  │              │   Score: 85/100                           │
│  │ Verification │                                           │
│  │    Score     │                                           │
│  └──────────────┘                                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📄 OCR Extracted Data                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Aadhaar Document                                           │
│  ┌───────────────────────────────────────────────────┐    │
│  │ Name:           Rajesh Kumar                       │    │
│  │ Aadhaar Number: 1234 5678 9012                     │    │
│  │ Address:        123 MG Road, Hyderabad             │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  Full OCR Text:                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │ GOVERNMENT OF INDIA                                │    │
│  │ UNIQUE IDENTIFICATION AUTHORITY OF INDIA           │    │
│  │ Name: Rajesh Kumar                                 │    │
│  │ Aadhaar Number: 1234 5678 9012                     │    │
│  │ Address: 123 MG Road, Bachupally, Hyderabad       │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  Business Document                                          │
│  ┌───────────────────────────────────────────────────┐    │
│  │ Business Name:  Sunrise Accommodation Services     │    │
│  │ GST Number:     29ABCDE1234F1Z5                    │    │
│  │ Phone:          +91-9876543210                     │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ✅ Verification Results                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Aadhaar Verification                                       │
│  ┌───────────────────────────────────────────────────┐    │
│  │ Status:      Verified                              │    │
│  │ Confidence:  95%                                   │    │
│  │ Risk Level:  Low                                   │    │
│  │ Explanation: All fields match successfully         │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  Business Document Verification                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │ Status:      Verified                              │    │
│  │ Confidence:  100%                                  │    │
│  │ Risk Level:  Low                                   │    │
│  │ Explanation: Perfect match on all fields           │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  [✓ Aadhaar Format]  [✓ GST Format]                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Admin Actions                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     [✓ Approve Verification]    [✗ Reject Verification]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**✅ OCR Verification page is working!**

---

## 📍 STEP 6: Test Admin Actions

### Test Approve

1. Click "✓ Approve Verification" button
2. Confirm dialog appears
3. Click "OK"

**What you'll see:**
```
┌─────────────────────────────────────────┐
│  ✅ Success!                            │
│  Verification approved successfully!    │
│  [OK]                                   │
└─────────────────────────────────────────┘
```

**Then redirects to provider list**

### Test Reject

1. Click "✗ Reject Verification" button
2. Prompt appears: "Enter rejection reason:"
3. Type: "Documents do not match"
4. Click "OK"

**What you'll see:**
```
┌─────────────────────────────────────────┐
│  ❌ Rejected                            │
│  Verification rejected                  │
│  [OK]                                   │
└─────────────────────────────────────────┘
```

**Then redirects to provider list**

---

## 📍 STEP 7: Verify in Database (Optional)

### Open MongoDB Compass or Terminal

```bash
mongosh
```

### Check Provider Data

```javascript
use trustbridge

db.serviceproviders.findOne(
  { _id: ObjectId("YOUR_PROVIDER_ID") },
  { 
    verificationStatus: 1,
    verificationScore: 1,
    ocrData: 1
  }
)
```

**What you'll see:**
```javascript
{
  _id: ObjectId("65abc123def456789"),
  verificationStatus: "APPROVED",
  verificationScore: 85,
  ocrData: {
    aadhaarExtracted: {
      name: "Rajesh Kumar",
      aadhaarNumber: "123456789012",
      address: "123 MG Road, Hyderabad"
    },
    businessExtracted: {
      businessName: "Sunrise Accommodation Services",
      gstNumber: "29ABCDE1234F1Z5",
      phone: "+91-9876543210"
    },
    aadhaarText: "GOVERNMENT OF INDIA...",
    businessText: "GOODS AND SERVICES TAX...",
    extractedAt: ISODate("2026-03-09T10:30:00Z")
  }
}
```

**✅ Data is saved correctly!**

---

## 🎯 What Each Color Means

### Verification Score Circle

```
┌──────────────┐
│              │
│      95      │  ← Green (80-100): Auto-Approve
│              │
│ Verification │
│    Score     │
└──────────────┘

┌──────────────┐
│              │
│      65      │  ← Yellow (40-79): Manual Review
│              │
│ Verification │
│    Score     │
└──────────────┘

┌──────────────┐
│              │
│      25      │  ← Red (0-39): Auto-Reject
│              │
│ Verification │
│    Score     │
└──────────────┘
```

### Status Badges

```
[APPROVED]   ← Green background
[PENDING]    ← Yellow background
[REJECTED]   ← Red background
[SUSPENDED]  ← Gray background
```

### Validation Badges

```
[✓ Aadhaar Format]  ← Green (valid)
[✗ Aadhaar Format]  ← Red (invalid)

[✓ GST Format]      ← Green (valid)
[✗ GST Format]      ← Red (invalid)
```

---

## ✅ Success Checklist

Check off each item as you complete it:

- [ ] Backend test passes (all ✅)
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Can login as admin
- [ ] Can access verification page
- [ ] See verification score circle
- [ ] See OCR extracted data
- [ ] See verification results
- [ ] See validation badges
- [ ] Approve button works
- [ ] Reject button works
- [ ] Data saved in database

**If all checked, OCR system is fully working! 🎉**

---

## 🐛 Common Issues & Visual Fixes

### Issue: Blank Page

**What you see:**
```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│         (Nothing displays)              │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**Fix:**
1. Open browser console (F12)
2. Check for errors
3. Verify route is added to App.jsx
4. Check provider/resident ID exists

### Issue: 404 Not Found

**What you see:**
```
┌─────────────────────────────────────────┐
│  404 - Not Found                        │
│  The page you're looking for doesn't    │
│  exist.                                 │
└─────────────────────────────────────────┘
```

**Fix:**
1. Check URL is correct
2. Verify routes added to server.js
3. Restart backend server

### Issue: No OCR Data

**What you see:**
```
┌─────────────────────────────────────────┐
│  OCR Extracted Data                     │
│  ┌───────────────────────────────────┐ │
│  │ Name: Not extracted                │ │
│  │ Aadhaar: Not extracted             │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Fix:**
1. Documents haven't been processed yet
2. Upload documents through provider registration
3. Or use API to upload documents

---

## 🎉 You're Done!

If you can see the verification page with OCR data, your system is working perfectly!

**Next Steps:**
1. Test with real documents
2. Adjust scoring thresholds if needed
3. Train admins on the system
4. Deploy to production

---

**Status**: ✅ Complete
**Time**: 10-15 minutes
**Difficulty**: Easy

🚀 Your OCR verification system is live and working!
