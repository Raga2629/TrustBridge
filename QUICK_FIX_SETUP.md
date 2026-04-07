# Quick Fix Setup - Local Resident Registration

## Problem Fixed
✅ File upload now working with multer
✅ Detailed error messages displayed
✅ Proper validation on backend and frontend
✅ Debug logging added

---

## Installation (2 Steps)

### Step 1: Install Multer
```bash
cd trustbridge-backend
npm install multer
```

### Step 2: Restart Backend
```bash
npm start
```

That's it! The upload directory will be created automatically.

---

## Test Registration

1. Open browser: `http://localhost:5175`
2. Go to `/role-selection`
3. Select "Local Resident"
4. Fill the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - City: Hyderabad
   - Area: Bachupally
   - Years Staying: 5
   - Upload a `.jpg`, `.png`, or `.pdf` file (< 5MB)
   - Check terms agreement
5. Click "Register as Local Resident"
6. Should redirect to "Verification Pending" page

---

## Check Backend Logs

You should see:
```
=== RESIDENT REGISTRATION DEBUG ===
Request body: { city: 'Hyderabad', area: 'Bachupally', yearsStaying: '5', agreeToTerms: 'true' }
Uploaded file: {
  fieldname: 'proofDocument',
  originalname: 'document.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: './uploads/resident-proofs',
  filename: 'proof-1708473600000-123456789.jpg',
  path: 'uploads/resident-proofs/proof-1708473600000-123456789.jpg',
  size: 245678
}
User: { _id: '...', name: 'Test User', email: 'test@example.com', role: 'LOCAL_RESIDENT' }
Resident created successfully: 65d5f8a9b1c2d3e4f5a6b7c8
```

---

## Verify File Upload

```bash
# Check if file was saved
ls -la trustbridge-backend/uploads/resident-proofs/

# You should see:
proof-1708473600000-123456789.jpg
```

---

## Common Errors & Solutions

### Error: "Cannot find module 'multer'"
**Solution:** Run `npm install multer` in trustbridge-backend

### Error: "Please upload proof document"
**Solution:** Make sure you selected a file before submitting

### Error: "Only .jpg, .jpeg, .png, and .pdf files are allowed"
**Solution:** Upload a valid image or PDF file

### Error: "File size too large. Maximum size is 5MB."
**Solution:** Reduce file size or use a smaller file

### Error: "Registration failed"
**Solution:** Check backend logs for detailed error message

---

## What Changed

### Backend
1. ✅ Created `middleware/uploadMiddleware.js` - Handles file uploads
2. ✅ Updated `controllers/residentController.js` - Uses `req.file.path`
3. ✅ Updated `routes/residentRoutes.js` - Added multer middleware
4. ✅ Updated `package.json` - Added multer dependency
5. ✅ Updated `.gitignore` - Excludes uploads directory

### Frontend
6. ✅ Updated `pages/LocalResidentSignup.jsx` - Uses FormData for file upload

---

## Files to Check

If something doesn't work, verify these files were updated:

```bash
# Backend
trustbridge-backend/middleware/uploadMiddleware.js (NEW FILE)
trustbridge-backend/controllers/residentController.js (MODIFIED)
trustbridge-backend/routes/residentRoutes.js (MODIFIED)
trustbridge-backend/package.json (MODIFIED)
trustbridge-backend/.gitignore (MODIFIED)

# Frontend
trustbridge-v2/src/pages/LocalResidentSignup.jsx (MODIFIED)
```

---

## Admin Verification

After registration:

1. Login as ADMIN
2. Go to `/admin/residents`
3. You should see the pending resident
4. Click "Approve" to verify
5. Resident can now login

---

## Need Help?

Check these files for detailed information:
- `LOCAL_RESIDENT_FIX.md` - Complete technical documentation
- `LOCAL_RESIDENT_SYSTEM.md` - Full system documentation
- Backend logs - For error details
- Browser console - For frontend errors

---

**Status:** ✅ Ready to Test
**Installation Time:** < 1 minute
**Testing Time:** < 2 minutes
