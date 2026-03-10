# 🔧 MongoDB Connection Fix

## Problem
```
Error: connect ECONNREFUSED 127.0.0.1:27017
[nodemon] app crashed - waiting for file changes before starting...
```

This means MongoDB is not running on your system.

## Solution - Start MongoDB

### Option 1: Start MongoDB Service (Recommended)
```cmd
net start MongoDB
```

### Option 2: If MongoDB Service Doesn't Exist
```cmd
mongod --dbpath "C:\data\db"
```

### Option 3: Using MongoDB Compass
1. Open MongoDB Compass application
2. It will automatically start MongoDB
3. Connect to `mongodb://localhost:27017`

## Verify MongoDB is Running

```cmd
mongosh --eval "db.version()"
```

**Expected output:** MongoDB version number (e.g., 7.0.5)

## After MongoDB Starts

Your backend will automatically reconnect (nodemon is watching).

You should see:
```
Server running on port 5000
MongoDB Connected: 127.0.0.1
```

## If MongoDB is Not Installed

### Download MongoDB Community Edition
1. Go to: https://www.mongodb.com/try/download/community
2. Download Windows version
3. Install with default settings
4. MongoDB will be installed as a Windows service

### Quick Install Check
```cmd
mongod --version
```

If this shows a version, MongoDB is installed.

## Common MongoDB Issues

### Issue: "net start MongoDB" fails
**Solution:** MongoDB might be installed but not as a service.

Run manually:
```cmd
mongod --dbpath "C:\data\db"
```

Keep this terminal open while using TrustBridge.

### Issue: "mongod" command not found
**Solution:** MongoDB is not installed or not in PATH.

1. Check if MongoDB is installed: `C:\Program Files\MongoDB\`
2. If not, download and install from MongoDB website
3. Add to PATH or use full path

### Issue: Data directory not found
**Solution:** Create the data directory.

```cmd
mkdir C:\data\db
mongod --dbpath "C:\data\db"
```

## Complete Startup Sequence

### Step 1: Start MongoDB
```cmd
net start MongoDB
```

### Step 2: Verify MongoDB
```cmd
mongosh --eval "db.version()"
```

### Step 3: Backend Auto-Reconnects
Your nodemon will automatically restart and connect.

You'll see:
```
[nodemon] restarting due to changes...
[nodemon] starting `node server.js`
Server running on port 5000
MongoDB Connected: 127.0.0.1
```

### Step 4: Start Frontend (New Terminal)
```cmd
cd trustbridge-v2
npm run dev
```

## Updated Batch Script

I'll update the start script to check MongoDB more thoroughly.

## Quick Test

Once MongoDB is running, test the connection:

```cmd
mongosh
```

Then in mongosh:
```javascript
show dbs
use trustbridge
show collections
```

You should see your TrustBridge database and collections.

## Success Indicators

✅ MongoDB service is running
✅ Backend shows "MongoDB Connected: 127.0.0.1"
✅ No "ECONNREFUSED" errors
✅ Backend stays running (doesn't crash)

## Next Steps

1. Start MongoDB using one of the options above
2. Backend will auto-reconnect (nodemon watching)
3. Start frontend: `cd trustbridge-v2 && npm run dev`
4. Test login at http://localhost:5173/login

---

**The backend is working fine. We just need MongoDB running!** 🚀
