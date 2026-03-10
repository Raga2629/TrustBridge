# Role Authorization Fix - Testing Guide

## ✅ Servers Running

**Backend:** http://localhost:5000 (Running)
**Frontend:** http://localhost:5173 (Running)

---

## Test Scenario: Logout → Signup as LOCAL_RESIDENT

### Step 1: Login as Existing USER (if you have one)
1. Go to http://localhost:5173/login
2. Login with existing USER credentials
3. Should redirect to `/dashboard`

### Step 2: Logout
1. Click "Logout" button
2. Should redirect to `/login`
3. **Verify:** localStorage is cleared
   - Open browser console (F12)
   - Type: `localStorage.getItem('token')`
   - Should return: `null`
   - Type: `localStorage.getItem('user')`
   - Should return: `null`

### Step 3: Signup as LOCAL_RESIDENT
1. Click "Sign Up" or go to `/role-selection`
2. Select "Local Resident"
3. Fill the registration form:
   - Name: Test Resident
   - Email: resident@test.com
   - Password: password123
   - City: Hyderabad
   - Area: Bachupally
   - Years Staying: 5
   - Upload a valid file (.jpg, .png, or .pdf < 5MB)
   - Check terms agreement
4. Click "Register as Local Resident"
5. Should redirect to `/verification-pending`

### Step 4: Try to Login (Before Approval)
1. Go to `/login`
2. Enter credentials:
   - Email: resident@test.com
   - Password: password123
3. Click "Login"
4. **Expected:** Error message:
   - "Your account is under review. Please wait for admin approval."
5. **Should NOT:** Get token or access dashboard

### Step 5: Admin Approval
1. Logout (if logged in)
2. Login as ADMIN (you need to create one first if you don't have)
3. Go to `/admin/residents`
4. Find the pending resident
5. Click "Approve"
6. Logout

### Step 6: Login as Approved LOCAL_RESIDENT
1. Go to `/login`
2. Enter credentials:
   - Email: resident@test.com
   - Password: password123
3. Click "Login"
4. **Expected:** 
   - ✅ Login successful
   - ✅ Redirects to `/local-resident/dashboard`
   - ✅ Shows Local Resident Dashboard
   - ✅ NO "not authorized" error

---

## Quick Test: Role-Based Redirects

### Test USER Login
```
Email: (your USER email)
Password: (your password)
Expected: → /dashboard
```

### Test LOCAL_RESIDENT Login (Approved)
```
Email: resident@test.com
Password: password123
Expected: → /local-resident/dashboard
```

### Test ADMIN Login
```
Email: (your ADMIN email)
Password: (your password)
Expected: → /admin/dashboard
```

---

## Verification Checklist

### ✅ Logout Works Properly
- [ ] Token removed from localStorage
- [ ] User removed from localStorage
- [ ] Page redirects to /login
- [ ] No cached state remains

### ✅ Role-Based Redirect Works
- [ ] USER → /dashboard
- [ ] LOCAL_RESIDENT → /local-resident/dashboard
- [ ] ADMIN → /admin/dashboard
- [ ] PROVIDER → /provider/dashboard

### ✅ Verification Blocking Works
- [ ] PENDING status blocks login
- [ ] Shows "under review" message
- [ ] No token issued
- [ ] Cannot access dashboard

### ✅ Approved Access Works
- [ ] APPROVED status allows login
- [ ] Token issued
- [ ] Redirects to correct dashboard
- [ ] No authorization errors

---

## Common Issues & Solutions

### Issue: Still seeing "not authorized" error

**Solution 1: Clear Browser Cache**
```
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

**Solution 2: Clear localStorage Manually**
```javascript
// In browser console
localStorage.clear();
// Then refresh page
```

**Solution 3: Check Role in Token**
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('user'));
console.log('Role:', user?.role);
// Should be: "LOCAL_RESIDENT"
```

---

### Issue: Login blocked after approval

**Check Verification Status:**
```javascript
// In MongoDB or backend logs
db.residents.findOne({ user: ObjectId('...') })
// verificationStatus should be "APPROVED"
```

**Solution:**
- Ensure admin clicked "Approve"
- Check backend logs for approval confirmation
- Try logging in again

---

### Issue: Wrong dashboard after login

**Check Login.jsx:**
```javascript
// Should have this case:
case 'LOCAL_RESIDENT':
  navigate('/local-resident/dashboard');
  break;
```

**Check App.jsx:**
```javascript
// Should have this route:
<Route
  path="/local-resident/dashboard"
  element={
    <ProtectedRoute allowedRoles={['LOCAL_RESIDENT']}>
      <LocalDashboard />
    </ProtectedRoute>
  }
/>
```

---

## Backend Logs to Watch

### Successful Registration
```
=== RESIDENT REGISTRATION DEBUG ===
Request body: { city: 'Hyderabad', area: 'Bachupally', ... }
Uploaded file: { fieldname: 'proofDocument', ... }
Resident created successfully: {id}
```

### Login Attempt (PENDING)
```
Login blocked: verificationStatus = PENDING
```

### Login Success (APPROVED)
```
Login successful: role = LOCAL_RESIDENT
Token issued
```

---

## Database Verification

### Check User Role
```javascript
db.users.findOne({ email: 'resident@test.com' })
// role should be: "LOCAL_RESIDENT"
```

### Check Resident Status
```javascript
db.residents.findOne({ user: ObjectId('...') })
// verificationStatus should be: "APPROVED" (after admin approval)
```

---

## What Was Fixed

1. ✅ Login controller checks verification status
2. ✅ Login blocks non-approved residents
3. ✅ Login.jsx redirects LOCAL_RESIDENT to correct dashboard
4. ✅ Logout clears all localStorage data
5. ✅ Logout forces page reload
6. ✅ Navbar handles LOCAL_RESIDENT dashboard link

---

## Need Help?

**Check these files:**
- `ROLE_AUTHORIZATION_FIX.md` - Complete technical details
- Backend logs - For server-side errors
- Browser console - For frontend errors
- Network tab - For API responses

**Common Commands:**
```bash
# Restart backend
cd trustbridge-backend
npm start

# Restart frontend
cd trustbridge-v2
npm run dev

# Check MongoDB
mongosh
use trustbridge
db.users.find()
db.residents.find()
```

---

**Status:** ✅ Ready to Test
**Servers:** ✅ Running
**Expected Result:** No "not authorized" errors after logout → signup flow
