# ✅ How to See Approved Providers

## Current Situation

The "Approved" tab is empty because no providers have been approved yet. The test provider is still in "PENDING" status.

---

## Quick Fix: Approve the Test Provider

### Option 1: Use the Script (Fastest)

```bash
cd trustbridge-backend
node approveTestProvider.js
```

This will:
1. Find the test provider
2. Change status from PENDING → APPROVED
3. Set proofVerified = true
4. Add verifiedAt timestamp

Then refresh the page and click "Approved" tab - you'll see it!

---

### Option 2: Use the UI (Proper Way)

**Step 1: Restart Backend**
```bash
cd trustbridge-backend
# Stop with Ctrl+C if running
npm start
```

**Step 2: Login as Admin**
- Go to: http://localhost:5173/admin/login
- Email: admin@trustbridge.com
- Password: admin123

**Step 3: Go to Service Verification**
- Click "Service Verification" tab in dashboard
- You'll see "Sunrise Accommodation Services" in "Pending Verification"

**Step 4: Review and Approve**
- Click "🔍 Review with OCR" button
- Review the OCR data and verification score
- Click "✓ Approve Verification" button
- You'll see success message

**Step 5: Check Approved Tab**
- Click "← Back to List"
- Click "Approved" tab
- The provider is now there!

---

## How the Tabs Work

### Pending Verification Tab
Shows providers where:
```javascript
verificationStatus === 'PENDING'
```

### Approved Tab
Shows providers where:
```javascript
verificationStatus === 'APPROVED'
```

---

## What Happens When You Approve

### Backend Updates:
```javascript
provider.verificationStatus = 'APPROVED'
provider.proofVerified = true
provider.verifiedAt = new Date()
```

### Frontend Behavior:
1. Provider disappears from "Pending Verification" tab
2. Provider appears in "Approved" tab
3. Status badge shows green "APPROVED"
4. Button changes to "👁️ View Details"

---

## Testing Flow

### 1. Check Pending Tab
```
[Pending Verification] [Approved]
     (active)

┌─────────────────────────────────────┐
│ Sunrise Accommodation Services      │
│ Status: PENDING                     │
│ Score: 85/100                       │
│ [🔍 Review with OCR]                │
└─────────────────────────────────────┘
```

### 2. Approve Provider
Click "Review with OCR" → Click "Approve"

### 3. Check Approved Tab
```
[Pending Verification] [Approved]
                       (active)

┌─────────────────────────────────────┐
│ Sunrise Accommodation Services      │
│ Status: APPROVED ✓                  │
│ Score: 85/100                       │
│ Verified: Jan 1, 2024               │
│ [👁️ View Details]                   │
└─────────────────────────────────────┘
```

---

## Quick Commands

### Approve test provider:
```bash
cd trustbridge-backend
node approveTestProvider.js
```

### Create new test provider:
```bash
cd trustbridge-backend
node seedTestVerification.js
```

### Check provider status:
```bash
cd trustbridge-backend
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/trustbridge').then(async () => {
  const ServiceProvider = require('./models/ServiceProvider');
  const providers = await ServiceProvider.find();
  console.log('Providers:', providers.map(p => ({
    business: p.businessName,
    status: p.verificationStatus,
    score: p.verificationScore
  })));
  process.exit(0);
});
"
```

---

## Summary

**To see approved providers:**
1. Run: `node approveTestProvider.js`
2. Refresh browser
3. Click "Approved" tab
4. Provider is there!

**OR**

1. Restart backend
2. Login as admin
3. Go to Service Verification
4. Click "Review with OCR"
5. Click "Approve"
6. Check "Approved" tab

---

**Run the script now to see it working!**
