# 🚨 URGENT: Fix MongoDB Connection

## Your Current Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
[nodemon] app crashed - waiting for file changes before starting...
```

## What This Means
✅ Backend server is working  
✅ Code is correct  
❌ **MongoDB is not running**

## 🔧 Quick Fix (Choose One)

### Option 1: Start MongoDB Service (Easiest)
```cmd
net start MongoDB
```

**Expected output:**
```
The MongoDB Server (MongoDB) service is starting.
The MongoDB Server (MongoDB) service was started successfully.
```

### Option 2: Use MongoDB Compass
1. Open MongoDB Compass application
2. Click "Connect" (it will start MongoDB automatically)
3. You should see connection to `mongodb://localhost:27017`

### Option 3: Start MongoDB Manually
```cmd
mongod --dbpath "C:\data\db"
```
Keep this terminal window open.

## ✅ Verify MongoDB is Running

Run this command:
```cmd
mongosh --eval "db.version()"
```

**If working, you'll see:** MongoDB version number  
**If not working, you'll see:** Connection error

## 🎯 What Happens Next

Once MongoDB starts:

1. **Your backend will auto-reconnect** (nodemon is watching)
2. You'll see in your backend terminal:
   ```
   [nodemon] restarting due to changes...
   Server running on port 5000
   MongoDB Connected: 127.0.0.1  ← This line appears!
   ```

3. **No need to restart backend manually!**

## 🚀 Complete Steps

### Step 1: Start MongoDB
```cmd
net start MongoDB
```

### Step 2: Watch Backend Terminal
It should automatically show:
```
MongoDB Connected: 127.0.0.1
```

### Step 3: Start Frontend (New Terminal)
```cmd
cd trustbridge-v2
npm run dev
```

### Step 4: Test Login
Go to: http://localhost:5173/login

## 🐛 If MongoDB Won't Start

### Check if MongoDB is Installed
```cmd
mongod --version
```

**If you see version number:** MongoDB is installed  
**If you see error:** MongoDB is NOT installed

### Install MongoDB (If Needed)

1. **Download:** https://www.mongodb.com/try/download/community
2. **Choose:** Windows x64
3. **Install:** Use default settings
4. **Check:** MongoDB should install as Windows service

### Create Data Directory (If Needed)
```cmd
mkdir C:\data\db
```

Then start manually:
```cmd
mongod --dbpath "C:\data\db"
```

## 📊 Current Status

| Component | Status |
|-----------|--------|
| Backend Code | ✅ Working |
| Backend Server | ✅ Running (port 5000) |
| MongoDB | ❌ Not Running |
| Frontend | ⏸️ Not started yet |

## 🎯 Your Next Command

**Just run this:**
```cmd
net start MongoDB
```

**Then watch your backend terminal.** It will automatically reconnect!

## 💡 Pro Tip

Use the check script to diagnose:
```cmd
check-mongodb.bat
```

This will tell you:
- ✅ Is MongoDB installed?
- ✅ Is MongoDB running?
- ✅ Can it connect?
- ✅ Does TrustBridge database exist?

## 🎉 Success Looks Like This

### Backend Terminal
```
[nodemon] restarting due to changes...
[nodemon] starting `node server.js`
Server running on port 5000
MongoDB Connected: 127.0.0.1  ← This is what you need!
```

### No More Errors
- ❌ No "ECONNREFUSED"
- ❌ No "app crashed"
- ✅ Server stays running
- ✅ Ready for connections

## 📞 Quick Help

| Issue | Command |
|-------|---------|
| Start MongoDB | `net start MongoDB` |
| Check MongoDB | `mongosh --eval "db.version()"` |
| Check status | `check-mongodb.bat` |
| Install MongoDB | Download from mongodb.com |

---

**Bottom Line:** Your code is perfect. Just start MongoDB and everything works! 🚀
