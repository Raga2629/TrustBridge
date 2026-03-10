# ⚡ EASIEST FIX - No Admin Needed!

## The Problem
```
System error 5 has occurred.
Access is denied.
```

You need admin privileges to start MongoDB as a service.

## ✅ EASIEST SOLUTION (No Admin Required)

### Use MongoDB Compass

1. **Open MongoDB Compass** (search in Start Menu)
2. **Click "Connect"** button
3. **Done!** MongoDB is running

Your backend will automatically reconnect!

---

## Don't Have MongoDB Compass?

### Download It (Free)
https://www.mongodb.com/try/download/compass

- Choose: Windows x64
- Install with defaults
- Open from Start Menu

---

## Alternative: Manual Start (No Admin)

### Create data folder:
```cmd
mkdir C:\data\db
```

### Start MongoDB:
```cmd
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

**Keep this terminal open!**

---

## What Happens Next

### Your Backend Terminal Shows:
```
[nodemon] restarting...
Server running on port 5000
MongoDB Connected: 127.0.0.1  ← Success!
```

### Then Start Frontend:
```cmd
cd D:\TrustBridge\trustbridge-v2
npm run dev
```

### Then Test:
http://localhost:5173

---

## Quick Comparison

| Method | Admin? | Difficulty |
|--------|--------|-----------|
| MongoDB Compass | ❌ No | ⭐ Easiest |
| Manual mongod | ❌ No | ⭐⭐ Easy |
| net start | ✅ Yes | ⭐⭐⭐ Hard |

---

## Recommended Steps

1. ✅ Open MongoDB Compass
2. ✅ Click Connect
3. ✅ Watch backend auto-reconnect
4. ✅ Start frontend
5. ✅ Test login

---

## Need More Help?

- **MongoDB Compass Guide:** `USE_MONGODB_COMPASS.md`
- **Admin Method:** `ADMIN_PRIVILEGES_FIX.md`
- **Visual Guide:** `MONGODB_STATUS_VISUAL.md`

---

**Just use MongoDB Compass - it's the easiest way!** 🎯
