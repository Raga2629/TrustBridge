# 🧪 How to Test OCR Verification in Your App

## 📋 Prerequisites Checklist

Before testing, ensure:

- [ ] Backend server is running (`npm start` in trustbridge-backend)
- [ ] Frontend server is running (`npm run dev` in trustbridge-v2)
- [ ] MongoDB is running
- [ ] Dependencies installed (`tesseract.js`, `multer`)
- [ ] Upload folder created (`uploads/verification-documents`)
- [ ] Routes added to server.js
- [ ] Frontend route added to App.jsx

---

## 🚀 Quick Setup (If Not Done)

### Step 1: Install Dependencies

```bash
cd trustbridge-backend
npm install tesseract.js multer
```

### Step 2: Create Upload Folder

```bash
mkdir -p uploads/verification-documents
```

### Step 3: Add Routes to server.js

Open `trustbridge-backend/server.js` and add:

```javascript
// Add at top with other requires (around line 10-20)
const ocrVerificationRoutes = require('./routes/ocrVerificationRoutes');

// Add after other routes (around line 50-60, before error handler)
app.use('/api/ocr-verification', ocrVerificationRoutes);
```

### Step 4: Add Frontend Route

Open `trustbridge-v2/src/App.jsx` and add:

```javascript
// Add import at top
import AdminOCRVerification from './pages/AdminOCRVerification';

// Add route inside <Routes> (around line 40-50)
<Route path="/admin/verification/:type/:id" element={<AdminOCRVerification />} />
```

### Step 5: Restart Servers

```bash
# Terminal 1 - Backend
cd trustbridge-backend
npm start

# Terminal 2 - Frontend
cd trustbridge-v2
npm run dev
```

---

## 🧪 Testing Methods

### Method 1: Test Backend Only (Fastest - No UI)

This tests the OCR logic without needing the full app.

```bash
cd trustbridge-backend
node testOCRVerification.js
```

**Expected Output:**
```
🧪 TRUSTBRIDGE OCR VERIFICATION SYSTEM - TEST SUITE
================================================================================

📋 TEST 1: Aadhaar Format Validation
--------------------------------------------------------------------------------
1. "1234 5678 9012" → true ✅ PASS
2. "123456789012" → true ✅ PASS

📋 TEST 2: GST Format Validation
--------------------------------------------------------------------------------
1. "22AAAAA0000A1Z5" → true ✅ PASS
2. "29ABCDE1234F1Z5" → true ✅ PASS

📋 TEST 3: Field Extraction from Sample Text
--------------------------------------------------------------------------------
Extracted Fields: { name, aadhaarNumber, gstNumber, ... }

📋 TEST 4: Document Verification
--------------------------------------------------------------------------------
Test Case 1: Perfect Match → Verified ✅ PASS
Test Case 2: Name Mismatch → Suspicious ✅ PASS
Test Case 3: Suspicious Document → Rejected ✅ PASS

📊 TEST SUMMARY
✅ All tests passed!
```

---

### Method 2: Test with Postman/Thunder Client (API Testing)

#### Test Service Provider Verification

**1. Create a Service Provider First**

You need a provider ID to test. If you don't have one, create a provider through your app or use an existing one.

**2. Test OCR Verification API**

```http
POST http://localhost:5000/api/ocr-verification/provider/YOUR_PROVIDER_ID
Content-Type: multipart/form-data
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Form Data:**
- `aadhaarDocument`: [Upload an image file]
- `businessProof`: [Upload an image file]
- `businessName`: "Sunrise Services"
- `ownerName`: "Rajesh Kumar"
- `address`: "123 MG Road, Hyderabad"
- `phone`: "9876543210"
- `gstNumber`: "29ABCDE1234F1Z5"
- `aadhaarNumber`: "123456789012"

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification successful",
  "verificationScore": 85,
  "status": "APPROVED",
  "details": {
    "aadhaarVerification": {...},
    "businessVerification": {...},
    "extractedFields": {...}
  }
}
```

---

### Method 3: Test in Browser (Full App Testing)

This is the complete end-to-end test.

#### Step 1: Login as Admin

1. Open browser: `http://localhost:5173`
2. Go to Admin Login: `http://localhost:5173/admin/login`
3. Login with admin credentials:
   - Email: `admin@trustbridge.com`
   - Password: `admin123`

#### Step 2: Find a Pending Provider/Resident

**Option A: Check existing pending verifications**

1. Go to Admin Dashboard
2. Look for "Pending Verifications" section
3. Click on any pending provider or resident

**Option B: Create a test provider**

1. Logout from admin
2. Sign up as Service Provider
3. Upload documents during registration
4. Login back as admin
5. Find the new provider in pending list

#### Step 3: View OCR Verification Page

Navigate to:
```
http://localhost:5173/admin/verification/provider/PROVIDER_ID
```
or
```
http://localhost:5173/admin/verification/resident/RESIDENT_ID
```

**What You Should See:**

1. **Verification Score Circle**
   - Large number (0-100)
   - Color: Green (80+), Yellow (60-79), Red (<60)
   - Status badge (PENDING/APPROVED/REJECTED)

2. **OCR Extracted Data Section**
   - Extracted fields (Name, Aadhaar, GST, etc.)
   - Full OCR text preview

3. **Verification Results Section**
   - Status for each document
   - Confidence scores
   - Risk levels
   - Explanations
   - Mismatched fields (if any)

4. **Validation Badges**
   - ✓ Aadhaar Format
   - ✓ GST Format

5. **Admin Actions** (if status is PENDING)
   - Green "Approve" button
   - Red "Reject" button

#### Step 4: Test Admin Actions

**Test Approve:**
1. Click "✓ Approve Verification"
2. Confirm the action
3. Should redirect to provider/resident list
4. Provider/Resident status should change to APPROVED

**Test Reject:**
1. Click "✗ Reject Verification"
2. Enter rejection reason
3. Confirm
4. Should redirect to list
5. Status should change to REJECTED

---

## 🎯 Testing Scenarios

### Scenario 1: Perfect Match (Should Auto-Approve)

**Test Data:**
- Form Name: "Rajesh Kumar"
- Form Business: "Sunrise Services"
- Form GST: "29ABCDE1234F1Z5"

**Document Content (create a text image with):**
```
GOODS AND SERVICES TAX CERTIFICATE

Business Name: Sunrise Services
Proprietor: Rajesh Kumar
GSTIN: 29ABCDE1234F1Z5
Address: 123 MG Road, Hyderabad
```

**Expected Result:**
- Score: 90-100
- Status: APPROVED (auto)
- All validations pass

---

### Scenario 2: Name Mismatch (Should Flag for Review)

**Test Data:**
- Form Name: "John Doe"
- Form Business: "Quick Services"

**Document Content:**
```
Business License

Business: Different Business Name
Owner: Jane Smith
```

**Expected Result:**
- Score: 20-40
- Status: PENDING or REJECTED
- Mismatched fields shown

---

### Scenario 3: Fake Document (Should Auto-Reject)

**Test Data:**
- Any form data

**Document Content:**
```
SAMPLE CERTIFICATE - DO NOT USE

This is a template document
DRAFT - Not for official use
```

**Expected Result:**
- Score: 0
- Status: REJECTED (auto)
- Reason: "Suspicious patterns detected"

---

## 🔍 How to Check if OCR is Working

### Check 1: Backend Logs

When you upload documents, check backend terminal for:

```
🔍 Starting OCR extraction for: uploads/verification-documents/...
OCR Progress: 50%
OCR Progress: 100%
✅ OCR completed. Extracted 250 characters
```

### Check 2: Database

Check MongoDB for OCR data:

```bash
# Connect to MongoDB
mongosh

# Use your database
use trustbridge

# Check a provider's OCR data
db.serviceproviders.findOne(
  { _id: ObjectId("YOUR_PROVIDER_ID") },
  { ocrData: 1, verificationScore: 1, verificationStatus: 1 }
)
```

**Should see:**
```javascript
{
  ocrData: {
    aadhaarExtracted: { name: "...", aadhaarNumber: "..." },
    businessExtracted: { businessName: "...", gstNumber: "..." },
    aadhaarText: "full extracted text...",
    businessText: "full extracted text...",
    extractedAt: ISODate("...")
  },
  verificationScore: 85,
  verificationStatus: "APPROVED"
}
```

### Check 3: API Response

Test the status endpoint:

```bash
curl http://localhost:5000/api/ocr-verification/status/provider/PROVIDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Should return:**
```json
{
  "success": true,
  "data": {
    "verificationStatus": "APPROVED",
    "verificationScore": 85,
    "ocrData": {...},
    "verificationDetails": {...}
  }
}
```

---

## 🐛 Troubleshooting

### Issue 1: "Cannot find module 'tesseract.js'"

**Solution:**
```bash
cd trustbridge-backend
npm install tesseract.js
```

### Issue 2: "Route not found" (404 error)

**Solution:**
- Check that routes are added to `server.js`
- Restart backend server
- Verify route path: `/api/ocr-verification/...`

### Issue 3: "ENOENT: no such file or directory"

**Solution:**
```bash
mkdir -p uploads/verification-documents
```

### Issue 4: OCR extraction fails

**Possible causes:**
- File is not a valid image
- File is too large (>10MB)
- File format not supported

**Solution:**
- Use JPG, PNG, or PDF files
- Ensure file size < 10MB
- Check file is not corrupted

### Issue 5: Admin page shows blank

**Solution:**
- Check browser console for errors
- Verify frontend route is added to App.jsx
- Check if provider/resident ID exists
- Verify authentication token is valid

### Issue 6: Score is always 0

**Possible causes:**
- OCR couldn't extract text
- Image quality is poor
- Document is in wrong language

**Solution:**
- Use clear, high-quality images
- Ensure text is readable
- Use English language documents

---

## 📸 Creating Test Documents

### Method 1: Use Real Documents (Recommended)

Use actual Aadhaar cards and business certificates (with permission).

### Method 2: Create Mock Documents

Create simple text images using any image editor:

**Sample Aadhaar:**
```
GOVERNMENT OF INDIA
UNIQUE IDENTIFICATION AUTHORITY OF INDIA

Name: Rajesh Kumar
Aadhaar Number: 1234 5678 9012
Address: 123 MG Road, Bachupally, Hyderabad
DOB: 01/01/1990
```

**Sample GST Certificate:**
```
GOODS AND SERVICES TAX REGISTRATION CERTIFICATE

Business Name: Sunrise Accommodation Services
Proprietor: Rajesh Kumar
Business Address: 123 MG Road, Bachupally, Hyderabad
GSTIN: 29ABCDE1234F1Z5
Contact: +91-9876543210
Date of Registration: 01/01/2020
```

Save as JPG or PNG with good contrast (black text on white background).

---

## ✅ Success Indicators

You'll know OCR is working when:

✅ Backend test script passes all checks
✅ Backend logs show OCR progress
✅ Database contains `ocrData` field
✅ Admin UI displays extracted text
✅ Verification score is calculated
✅ Status changes based on score
✅ Approve/Reject buttons work

---

## 🎯 Quick Test Checklist

- [ ] Run `node testOCRVerification.js` → All tests pass
- [ ] Upload document via API → Returns verification result
- [ ] Check database → OCR data is saved
- [ ] View admin page → Shows OCR extracted text
- [ ] Click approve → Status changes to APPROVED
- [ ] Click reject → Status changes to REJECTED
- [ ] Check logs → No errors

---

## 📞 Need Help?

If you're stuck:

1. Check backend terminal for errors
2. Check browser console for errors
3. Verify all setup steps completed
4. Check MongoDB connection
5. Verify file permissions on uploads folder

---

## 🎉 Next Steps After Testing

Once OCR is working:

1. ✅ Test with real documents
2. ✅ Adjust scoring thresholds if needed
3. ✅ Train admins on verification process
4. ✅ Set up monitoring and alerts
5. ✅ Deploy to production

---

**Status**: Ready to Test
**Time Required**: 10-15 minutes
**Difficulty**: Easy

🚀 Start with Method 1 (backend test), then move to Method 3 (full app test)!
