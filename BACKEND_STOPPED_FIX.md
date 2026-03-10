# 🔧 Backend Stopped - Quick Fix

## Your Error
```
POST http://localhost:5000/api/auth/login
net::ERR_CONNECTION_REFUSED
Login failed: Network Error
```

## What This Means
Your backend server is not running anymore.

## ✅ Quick Fix

### Step 1: Go to Backend Folder
```cmd
cd D:\TrustBridge\trustbridge-backend
```

### Step 2: Start Backend
```cmd
npm run dev
```

### Step 3: Wait for Success Messages
```
[nodemon] starting `node server.js`
Server running on port 5000
MongoDB Connected: 127.0.0.1
```

### Step 4: Test Login
Refresh browser and try logging in again.

---

## Why Backend Stops

### Common Reasons:

1. **Terminal Closed**
   - You accidentally closed the backend terminal
   - **Fix:** Restart backend

2. **MongoDB Disconnected**
   - MongoDB Compass was closed
   - MongoDB service stopped
   - **Fix:** Start MongoDB first, then backend auto-reconnects

3. **Backend Crashed**
   - An error occurred in the code
   - Check terminal for error messages
   - **Fix:** Fix the error and restart

4. **Computer Restarted**
   - System was restarted or went to sleep
   - **Fix:** Restart both MongoDB and backend

---

## How to Keep Backend Running

### Option 1: Keep Terminal Open
- Don't close the backend terminal window
- Minimize it instead

### Option 2: Use Nodemon (Already Set Up)
- Backend auto-restarts on code changes
- But you still need to keep terminal open

### Option 3: Check Before Using
Run this before testing:
```cmd
check-backend.bat
```

---

## Complete Restart Sequence

If everything stopped:

### 1. Start MongoDB
**Option A:** Open MongoDB Compass → Click Connect

**Option B:** Run as admin:
```cmd
net start MongoDB
```

### 2. Start Backend
```cmd
cd D:\TrustBridge\trustbridge-backend
npm run dev
```

Wait for "MongoDB Connected: 127.0.0.1"

### 3. Start Frontend (if also stopped)
```cmd
cd D:\TrustBridge\trustbridge-v2
npm run dev
```

### 4. Test
Open: http://localhost:5173

---

## Quick Diagnostic

### Check Backend Status
```cmd
curl http://localhost:5000
```

**If working:** Shows `{"message":"TrustBridge API is running"}`  
**If not working:** Connection error

### Check MongoDB Status
```cmd
mongosh --eval "db.version()"
```

**If working:** Shows MongoDB version  
**If not working:** Connection error

### Check Frontend Status
Open: http://localhost:5173

**If working:** Page loads  
**If not working:** Can't connect

---

## Visual Status Check

### All Running ✅
```
┌──────────┐     ✅      ┌──────────┐     ✅      ┌──────────┐
│ Frontend │ ─────────> │ Backend  │ ─────────> │ MongoDB  │
│  :5173   │ <───────── │  :5000   │ <───────── │  :27017  │
└──────────┘            └──────────┘            └──────────┘
```

### Backend Stopped ❌
```
┌──────────┐     ❌      ┌──────────┐
│ Frontend │ ─────X───> │ Backend  │
│  :5173   │            │  STOPPED │
└──────────┘            └──────────┘

Error: ERR_CONNECTION_REFUSED
```

---

## Prevention Tips

1. **Keep terminals visible** - Don't close them
2. **Use MongoDB Compass** - Keep it open
3. **Check before testing** - Run `check-backend.bat`
4. **Watch for errors** - Monitor backend terminal
5. **Restart if needed** - Quick restart is easy

---

## Quick Commands

| Task | Command |
|------|---------|
| Check backend | `curl http://localhost:5000` |
| Start backend | `cd trustbridge-backend && npm run dev` |
| Check MongoDB | `mongosh --eval "db.version()"` |
| Start MongoDB | Open MongoDB Compass → Connect |
| Check all | `check-backend.bat` |

---

## Your Next Action

1. Open backend terminal (or open new one)
2. Run: `cd D:\TrustBridge\trustbridge-backend`
3. Run: `npm run dev`
4. Wait for "MongoDB Connected"
5. Refresh browser and test login

---

**Backend just needs to be restarted. Takes 10 seconds!** 🚀
