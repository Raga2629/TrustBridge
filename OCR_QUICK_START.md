# 🚀 OCR Verification System - Quick Start

## Install & Test in 5 Minutes

### Step 1: Install Dependencies (1 minute)

```bash
cd trustbridge-backend
npm install tesseract.js multer
```

### Step 2: Create Upload Folder (10 seconds)

```bash
mkdir -p uploads/verification-documents
```

### Step 3: Add Routes to server.js (30 seconds)

Open `trustbridge-backend/server.js` and add:

```javascript
// Add at top with other requires
const ocrVerificationRoutes = require('./routes/ocrVerificationRoutes');

// Add after other routes (around line 50-60)
app.use('/api/ocr-verification', ocrVerificationRoutes);
```

### Step 4: Test the System (1 minute)

```bash
node testOCRVerification.js
```

**Expected Output:**
```
✅ Aadhaar validation: Working
✅ GST validation: Working
✅ Field extraction: Working
✅ Document verification: Working

🎉 All OCR verification components are functional!
```

### Step 5: Update Frontend Routes (1 minute)

Open `trustbridge-v2/src/App.jsx` and add:

```javascript
// Add import
import AdminOCRVerification from './pages/AdminOCRVerification';

// Add route inside <Routes>
<Route path="/admin/verification/:type/:id" element={<AdminOCRVerification />} />
```

### Step 6: Restart Servers (30 seconds)

```bash
# Backend
cd trustbridge-backend
npm start

# Frontend (new terminal)
cd trustbridge-v2
npm run dev
```

---

## ✅ You're Done!

The OCR verification system is now active and ready to use!

---

## 🎯 How to Use

### For Service Providers

1. Provider signs up and uploads:
   - Aadhaar Card
   - GST Certificate/Business License

2. System automatically:
   - Extracts text using OCR
   - Validates Aadhaar (12 digits) and GST format
   - Matches name, business name, address
   - Calculates verification score (0-100)

3. Results:
   - **Score 80-100**: Auto-APPROVED ✅
   - **Score 40-79**: PENDING (Admin reviews)
   - **Score 0-39**: Auto-REJECTED ❌

### For Local Residents

1. Resident uploads:
   - Aadhaar Card OR Address Proof

2. System validates:
   - Name match
   - Address match
   - Aadhaar format

3. Results:
   - **Score 70-100**: Auto-APPROVED ✅
   - **Score 50-69**: PENDING
   - **Score 0-49**: Auto-REJECTED ❌

### For Admins

1. Go to: `/admin/verification/provider/:id` or `/admin/verification/resident/:id`

2. View:
   - Verification score
   - Extracted OCR text
   - Validation results
   - Mismatched fields

3. Actions:
   - Approve verification
   - Reject with reason

---

## 📊 What Gets Checked

### Service Providers (100 points total)

| Check | Points |
|-------|--------|
| Aadhaar format valid (12 digits) | +20 |
| GST format valid | +20 |
| Owner name matches (70% threshold) | +30 |
| Business name matches (70% threshold) | +30 |

### Local Residents (100 points total)

| Check | Points |
|-------|--------|
| Aadhaar format valid | +30 |
| Name matches (70% threshold) | +40 |
| Address matches (60% threshold) | +30 |

---

## 🔍 Fraud Detection

System automatically rejects:

❌ Template/sample documents
❌ Documents with "PHOTOSHOP", "EDITED", "DRAFT"
❌ Missing business keywords
❌ Insufficient content
❌ Critical field mismatches

---

## 🧪 Test API with Postman

### Test Service Provider Verification

```http
POST http://localhost:5000/api/ocr-verification/provider/:providerId
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

Body (form-data):
- aadhaarDocument: [upload image file]
- businessProof: [upload image file]
- businessName: "Sunrise Services"
- ownerName: "Rajesh Kumar"
- address: "123 MG Road, Hyderabad"
- phone: "9876543210"
- gstNumber: "29ABCDE1234F1Z5"
- aadhaarNumber: "123456789012"
```

### Test Resident Verification

```http
POST http://localhost:5000/api/ocr-verification/resident/:residentId
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

Body (form-data):
- document: [upload image file]
- fullName: "Amit Sharma"
- address: "456 Park Street, Hyderabad"
- aadhaarNumber: "987654321098"
```

---

## 📁 File Structure

```
trustbridge-backend/
├── utils/
│   ├── ocrService.js              ← OCR extraction
│   └── documentVerifier.js        ← Verification logic
├── controllers/
│   └── ocrVerificationController.js ← API handlers
├── routes/
│   └── ocrVerificationRoutes.js   ← API routes
├── models/
│   ├── ServiceProvider.js         ← Updated with OCR fields
│   └── Resident.js                ← Updated with OCR fields
└── testOCRVerification.js         ← Test suite

trustbridge-v2/
├── src/
│   ├── pages/
│   │   └── AdminOCRVerification.jsx ← Admin UI
│   └── styles/
│       └── AdminOCRVerification.css ← Styling
```

---

## 🎉 Success Indicators

You'll know it's working when:

✅ Test script passes all checks
✅ Server starts without errors
✅ Upload folder exists
✅ Routes respond to API calls
✅ Admin UI displays verification data
✅ Documents get verified automatically

---

## 🆘 Troubleshooting

### Issue: "Cannot find module 'tesseract.js'"
**Solution:**
```bash
npm install tesseract.js
```

### Issue: "ENOENT: no such file or directory"
**Solution:**
```bash
mkdir -p uploads/verification-documents
```

### Issue: "Route not found"
**Solution:** Check that routes are added to server.js

### Issue: OCR extraction fails
**Solution:** Ensure uploaded files are valid images (JPG, PNG, PDF)

---

## 📚 Full Documentation

For complete details, see: `OCR_VERIFICATION_COMPLETE_GUIDE.md`

---

**Status**: 🟢 Ready to Use
**Time to Setup**: 5 minutes
**Complexity**: Minimal

🎉 Your platform is now protected with AI-powered document verification!
