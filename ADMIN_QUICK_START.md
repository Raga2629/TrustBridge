# Admin Quick Start Guide

## Create Admin User (One-Time Setup)

### Step 1: Navigate to Backend
```bash
cd trustbridge-backend
```

### Step 2: Run Admin Seed Script
```bash
node seedAdmin.js
```

### Expected Output:
```
✅ Connected to MongoDB
✅ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: nasaniragamala@gmail.com
👤 Name: Nasani Ragamala
🔑 Password: raga@123
🛡️  Role: ADMIN
✓ Verified: true
💯 Trust Score: 100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 You can now login at: http://localhost:5173/admin/login
```

---

## Login as Admin

### Option 1: From Homepage
1. Go to: `http://localhost:5173/`
2. Scroll to footer
3. Click "🛡️ Admin Access" (bottom right)
4. Enter credentials:
   - Email: `nasaniragamala@gmail.com`
   - Password: `raga@123`
5. Click "Login as Admin"

### Option 2: Direct URL
1. Go to: `http://localhost:5173/admin/login`
2. Enter credentials
3. Click "Login as Admin"

---

## Admin Credentials

```
Email: nasaniragamala@gmail.com
Password: raga@123
```

**Note**: No signup required. Admin access is login-only.

---

## What You Can Do as Admin

✅ View platform statistics
✅ Moderate flagged reviews
✅ Approve/reject reviews
✅ Verify users
✅ Verify local residents
✅ Resolve complaints
✅ Monitor all platform activity

---

## Troubleshooting

### "Admin user already exists"
- Admin is already created
- Just login with the credentials above

### Cannot connect to MongoDB
- Make sure MongoDB is running
- Check `.env` file has correct `MONGO_URI`

### Login fails
- Verify you're using the correct email and password
- Make sure backend server is running
- Check browser console for errors

---

## Done! 🎉

You're now ready to monitor and manage the TrustBridge platform as an admin.
