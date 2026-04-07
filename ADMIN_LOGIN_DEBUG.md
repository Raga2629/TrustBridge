# Admin Login Debug Guide

## Step 1: Check if Admin User Exists

Run this command in the backend folder:
```bash
cd trustbridge-backend
node checkAdmin.js
```

This will verify:
- Admin user exists in database
- Email is correct
- Password hash is correct
- Password 'raga@123' matches

## Step 2: If Admin Doesn't Exist or Password Wrong

Delete and recreate admin:
```bash
cd trustbridge-backend
node seedAdmin.js
```

## Step 3: Test Login with Console Logs

1. Open browser console (F12)
2. Clear localStorage:
   ```javascript
   localStorage.clear()
   ```
3. Go to: http://localhost:5173/admin/login
4. Click "Login as Admin"
5. Watch console for these messages:
   - 🔐 Admin login attempt
   - 🔄 Sending login request to backend
   - 📦 Backend response
   - 💾 Storing user data
   - ✅ Login complete
   - ✅ Admin verified, redirecting to dashboard

## Step 4: Check What's in Console

If you see:
- ❌ Login failed → Backend issue or wrong credentials
- ❌ Not an admin user → User exists but role is not ADMIN
- No logs at all → Form not submitting

## Step 5: Manual Test

Open browser console and run:
```javascript
// Test backend directly
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'nasaniragamala@gmail.com',
    password: 'raga@123'
  })
})
.then(r => r.json())
.then(data => console.log('Backend response:', data))
.catch(err => console.error('Error:', err))
```

Expected response:
```json
{
  "_id": "...",
  "name": "Nasani Ragamala",
  "email": "nasaniragamala@gmail.com",
  "role": "ADMIN",
  "token": "..."
}
```

## Step 6: Check Backend is Running

Make sure backend is running on port 5000:
```bash
cd trustbridge-backend
npm start
```

Should see:
```
Server running on port 5000
MongoDB Connected
```

## Common Issues

### Issue: "Invalid credentials"
- Admin user doesn't exist → Run seedAdmin.js
- Wrong password → Check password is exactly 'raga@123'
- Backend not running → Start backend with npm start

### Issue: "Access denied"
- User exists but role is not ADMIN
- Check database: user role should be 'ADMIN' not 'USER'

### Issue: Redirects to /login
- Token not being stored
- Check localStorage after login
- Should have 'token' and 'user' keys

### Issue: Page refreshes but stays on admin login
- Check browser console for errors
- Check network tab for failed requests
- Verify backend response includes role: "ADMIN"
