# 🚀 Quick Reference Card

## Start Servers

```bash
# Terminal 1 - Backend
cd trustbridge-backend
npm start

# Terminal 2 - Frontend  
cd trustbridge-v2
npm run dev
```

## Admin Login

```
URL: http://localhost:5173/admin/login
Email: nasaniragamala@gmail.com
Password: raga@123
```

## Test Service Verification

1. Login as admin
2. Click "Service Verification" tab
3. See 3 services in "Pending" tab
4. Click "Verify" on any service
5. Check all 4 boxes
6. Click "Approve Service"
7. ✅ Done!

## Current Status

- Total Services: 62
- Verified: 59
- Pending: 3 (ready to verify)

## What's Changed

✅ Removed "Service Providers" tab from admin dashboard
✅ Service Verification shows only unverified services
✅ Detailed verification page with documents
✅ 4-point checklist (all must be checked)
✅ Service Image + Business Proof required
✅ Contact Phone + Email required

## Files Modified

### Frontend
- AdminDashboard.jsx
- AdminServiceVerificationPage.jsx
- AddService.jsx

### Backend
- Service.js (model)
- serviceController.js
- serviceUploadMiddleware.js

## Useful Scripts

```bash
# Check verification status
cd trustbridge-backend
node checkServiceVerification.js

# Mark seed services as verified (already done)
node verifySeedServices.js
```

## Documentation

- FINAL_CHECKLIST.md - Complete checklist
- SERVICE_VERIFICATION_COMPLETE_SUMMARY.md - Full documentation
- ADMIN_VERIFICATION_VISUAL_GUIDE.md - Visual walkthrough
- QUICK_START_VERIFICATION_TEST.md - Testing guide

## ✅ System Ready!

Everything is implemented and working. Just start the servers and test!
