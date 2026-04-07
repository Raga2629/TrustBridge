# Quick Test Guide - Service Provider Registration

## 🚀 Quick Start (2 Minutes)

### Prerequisites
- Backend running on port 5000 ✅ (Already running)
- Frontend running on port 5173

### Test Steps

1. **Start Frontend** (if not running)
   ```bash
   cd trustbridge-v2
   npm run dev
   ```

2. **Login as Service Provider**
   - Go to http://localhost:5173
   - Click "Login"
   - Use any service provider account

3. **Add New Service**
   - Click "Add Service" from dashboard
   - Fill all fields (see below)
   - Upload 2 files
   - Submit

4. **Verify Success**
   - See success message
   - Check `trustbridge-backend/uploads/` folders
   - Files should be saved

## 📋 Test Data

```
Service Name: Quick Test Shop
Category: Medical
Subcategory: Pharmacy
Description: Test pharmacy for verification
City: Hyderabad
Area: Bachupally
Address: Test Address, Main Road
Working Hours: 9 AM - 9 PM

Contact Phone: +91 9876543210 ⭐ REQUIRED
Contact Email: test@shop.com ⭐ REQUIRED

Service Image: [Any JPG/PNG photo] ⭐ REQUIRED
Business Proof: [Any PDF/image] ⭐ REQUIRED
```

## ✅ What to Check

### Frontend
- [ ] Price Range field NOT visible
- [ ] Contact Phone has `*` (required)
- [ ] Contact Email has `*` (required)
- [ ] Service Image upload box present
- [ ] Business Proof upload box present
- [ ] Field hints visible below inputs
- [ ] File inputs have dashed border
- [ ] Can't submit without all fields

### Backend
- [ ] Files saved to `uploads/service-images/`
- [ ] Files saved to `uploads/business-proofs/`
- [ ] Service created with `verified: false`
- [ ] `serviceImageUrl` field populated
- [ ] `businessProofUrl` field populated
- [ ] Contact phone stored
- [ ] Contact email stored

## 🎯 Expected Results

### Success Case
```
✅ "Service added successfully! It will be reviewed by admin."
→ Redirected to provider dashboard
→ Files saved in uploads folders
→ Service in database with verified: false
```

### Error Cases

**Missing Contact Phone:**
```
❌ "Please provide all required fields including contact phone, email, service image, and business proof"
```

**Missing Files:**
```
❌ "Please provide all required fields including contact phone, email, service image, and business proof"
```

**Wrong File Type:**
```
❌ "Only .jpg, .jpeg, .png, and .pdf files are allowed"
```

## 🔍 Quick Verification Commands

### Check if files were saved:
```bash
cd trustbridge-backend
dir uploads\service-images
dir uploads\business-proofs
```

### Check backend logs:
Look for:
```
=== CREATE SERVICE REQUEST ===
User: { ... }
Body: { ... }
Files: { serviceImage: [...], businessProof: [...] }
Creating service with data: { ... }
Service created successfully: [ID]
```

## 🐛 Troubleshooting

### Problem: Can't submit form
**Solution**: Fill ALL required fields including both file uploads

### Problem: Files not uploading
**Solution**: 
- Check file size (< 5MB)
- Check file type (JPG, PNG, PDF only)
- Check backend is running

### Problem: Backend error
**Solution**:
- Restart backend: `node server.js`
- Check MongoDB is running
- Check console for errors

## 📊 Implementation Status

| Requirement | Status | Notes |
|------------|--------|-------|
| Remove Price Range | ✅ DONE | Field completely removed |
| Required Contact Phone | ✅ DONE | Marked with *, validated |
| Required Contact Email | ✅ DONE | Marked with *, validated |
| Service Image Upload | ✅ DONE | Required, 5MB max |
| Business Proof Upload | ✅ DONE | Required, 5MB max |
| Frontend Validation | ✅ DONE | All fields checked |
| Backend Validation | ✅ DONE | Files and fields validated |
| File Storage | ✅ DONE | Separate directories |
| Database Schema | ✅ DONE | New fields added |
| Error Handling | ✅ DONE | Comprehensive messages |

## 🎉 Success Criteria

All three requirements met:
1. ✅ Price Range removed
2. ✅ Contact info required (not optional)
3. ✅ Two upload boxes added (both required)

**Status**: READY FOR TESTING ✅

---

**Quick Test Time**: ~2 minutes
**Full Test Time**: ~5 minutes
**Backend Status**: Running on port 5000 ✅
