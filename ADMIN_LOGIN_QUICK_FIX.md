# Admin Login - Quick Fix Steps

## Run These Commands NOW:

### 1. Check Admin User
```bash
cd trustbridge-backend
node checkAdmin.js
```

### 2. If Admin Doesn't Exist or Password Wrong
```bash
cd trustbridge-backend
node seedAdmin.js
```

### 3. Clear Browser and Test
1. Open browser console (F12)
2. Run: `localStorage.clear()`
3. Go to: http://localhost:5173/admin/login
4. Click "Login as Admin"
5. Watch console logs

## What to Look For in Console:

✅ GOOD - You should see:
```
🔐 Admin login attempt: nasaniragamala@gmail.com
🔄 Sending login request to backend...
📦 Backend response: {role: "ADMIN", ...}
💾 Storing user data: {role: "ADMIN", ...}
✅ Login complete, user state updated
✅ Admin verified, redirecting to dashboard...
```

❌ BAD - If you see:
```
❌ Login failed: Invalid email or password
```
→ Admin user doesn't exist or wrong password

```
❌ Not an admin user, role: USER
```
→ User exists but is not admin

## Admin Credentials
```
Email: nasaniragamala@gmail.com
Password: raga@123
```

## Still Not Working?

Share the console output with me and I'll fix it immediately.
