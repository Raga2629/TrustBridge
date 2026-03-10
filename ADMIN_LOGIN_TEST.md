# Admin Login Testing Guide

## Quick Test

### Step 1: Clear Browser Data
Open browser console (F12) and run:
```javascript
localStorage.clear()
```

### Step 2: Navigate to Admin Login
Go to: http://localhost:5173/admin/login

### Step 3: Login with Admin Credentials
```
Email: nasaniragamala@gmail.com
Password: raga@123
```

### Step 4: Verify Success
- Should redirect to: `/admin/dashboard`
- Should see admin dashboard with purple theme
- Should see 5 tabs: Statistics, Flagged Reviews, Users, Residents, Complaints

## If Admin User Doesn't Exist

Run the seed script:
```bash
cd trustbridge-backend
node seedAdmin.js
```

## Troubleshooting

### Issue: "Invalid credentials"
- Verify backend is running on port 5000
- Check MongoDB connection
- Ensure admin user exists in database

### Issue: "Access denied"
- User exists but role is not ADMIN
- Check user role in database
- Re-run seedAdmin.js if needed

### Issue: Still redirecting to user login
- Clear browser cache completely
- Check browser console for errors
- Verify token is being stored in localStorage

## Expected Behavior
1. Enter credentials → Click "Login as Admin"
2. AuthContext validates credentials with backend
3. Backend returns user data with role: "ADMIN"
4. Token stored in localStorage
5. User data stored in localStorage
6. Navigate to `/admin/dashboard`
7. ProtectedRoute checks role === "ADMIN"
8. Admin dashboard loads with custom navbar

## Admin Dashboard Features
- View platform statistics
- Manage flagged reviews
- Verify/suspend users
- Verify local residents
- Handle complaints
