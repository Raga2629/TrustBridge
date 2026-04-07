# 🔍 Is Your Backend Running?

## Quick Visual Check

### Look at Your Backend Terminal

### ✅ Backend is Running (GOOD)
```
PS D:\TrustBridge\trustbridge-backend> npm run dev

[nodemon] 3.1.11
[nodemon] starting `node server.js`
Server running on port 5000
MongoDB Connected: 127.0.0.1

[Cursor blinking, waiting for requests]
```

### ❌ Backend is NOT Running (BAD)

**Scenario 1: Terminal Closed**
```
[No terminal window visible]
```

**Scenario 2: Backend Crashed**
```
PS D:\TrustBridge\trustbridge-backend> npm run dev

[nodemon] starting `node server.js`
Server running on port 5000
Error: connect ECONNREFUSED 127.0.0.1:27017
[nodemon] app crashed - waiting for file changes
```

**Scenario 3: Stopped/Exited**
```
PS D:\TrustBridge\trustbridge-backend> npm run dev

[nodemon] starting `node server.js`
Server running on port 5000
MongoDB Connected: 127.0.0.1
^C [Ctrl+C pressed - server stopped]

PS D:\TrustBridge\trustbridge-backend> _
```

---

## Browser Console Check

### Press F12 in Browser → Console Tab

### ✅ Backend Running (GOOD)
```
Console
├─ 🔄 Sending login request to backend...
├─ 📦 Backend response: {user: {...}, token: "..."}
└─ ✅ Login complete
```

### ❌ Backend NOT Running (BAD)
```
Console
├─ 🔄 Sending login request to backend...
├─ ❌ POST http://localhost:5000/api/auth/login
│     net::ERR_CONNECTION_REFUSED
└─ ❌ Login failed: Network Error
```

---

## Quick Test Commands

### Test 1: Curl Backend
```cmd
curl http://localhost:5000
```

**Expected (if running):**
```json
{"message":"TrustBridge API is running"}
```

**If not running:**
```
curl: (7) Failed to connect to localhost port 5000
```

### Test 2: Check Port
```cmd
netstat -ano | findstr :5000
```

**Expected (if running):**
```
TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    12345
```

**If not running:**
```
[No output]
```

---

## What to Do Based on Status

### If Backend Terminal Shows "MongoDB Connected" ✅
**Status:** Backend is running  
**Action:** None needed, backend is fine  
**Issue:** Problem is elsewhere (check frontend)

### If Backend Terminal Shows "app crashed" ❌
**Status:** Backend crashed, MongoDB not connected  
**Action:** Start MongoDB first
1. Open MongoDB Compass → Connect
2. Backend will auto-restart

### If Backend Terminal is Closed ❌
**Status:** Backend not running  
**Action:** Restart backend
```cmd
cd D:\TrustBridge\trustbridge-backend
npm run dev
```

### If Backend Terminal Shows Error ❌
**Status:** Backend has an error  
**Action:** Read the error message
- MongoDB error? → Start MongoDB
- Code error? → Fix the code
- Port error? → Kill process on port 5000

---

## Common Scenarios

### Scenario 1: "I closed the terminal by accident"
**Solution:**
```cmd
cd D:\TrustBridge\trustbridge-backend
npm run dev
```

### Scenario 2: "I restarted my computer"
**Solution:**
1. Start MongoDB Compass → Connect
2. Start backend: `npm run dev`
3. Start frontend: `npm run dev`

### Scenario 3: "It was working, now it's not"
**Check:**
1. Is backend terminal still open?
2. Does it show "MongoDB Connected"?
3. Did MongoDB Compass close?

**Solution:**
- If MongoDB closed → Reopen Compass → Connect
- If backend closed → Restart backend
- If both closed → Restart both

### Scenario 4: "Backend keeps crashing"
**Check backend terminal for error:**
- MongoDB error → Start MongoDB
- Code error → Check the error message
- Port error → Kill process: `taskkill /F /IM node.exe`

---

## Visual Checklist

### Before Testing Login:

- [ ] Backend terminal is open
- [ ] Shows "Server running on port 5000"
- [ ] Shows "MongoDB Connected: 127.0.0.1"
- [ ] No error messages
- [ ] Cursor is blinking (waiting)
- [ ] MongoDB Compass is connected (or service running)
- [ ] Frontend is running (localhost:5173)

### If Any Box is Unchecked:
Fix that component first!

---

## Quick Reference

| Symptom | Cause | Fix |
|---------|-------|-----|
| ERR_CONNECTION_REFUSED | Backend not running | Restart backend |
| "app crashed" | MongoDB not running | Start MongoDB |
| Terminal closed | Accidentally closed | Reopen and start |
| No "MongoDB Connected" | MongoDB issue | Start MongoDB first |
| Port already in use | Old process running | Kill: `taskkill /F /IM node.exe` |

---

## Your Current Issue

Based on your screenshot:
```
❌ POST http://localhost:5000/api/auth/login
   net::ERR_CONNECTION_REFUSED
❌ Login failed: Network Error
```

**Diagnosis:** Backend is NOT running

**Solution:**
```cmd
cd D:\TrustBridge\trustbridge-backend
npm run dev
```

Wait for "MongoDB Connected: 127.0.0.1", then test login again.

---

## Prevention

### Keep These Open:
1. ✅ Backend terminal (showing "MongoDB Connected")
2. ✅ Frontend terminal (showing "Local: http://localhost:5173")
3. ✅ MongoDB Compass (showing "Connected")

### Don't Close:
- ❌ Backend terminal
- ❌ Frontend terminal  
- ❌ MongoDB Compass (if using it)

### Before Testing:
Run: `check-backend.bat` to verify everything is running

---

**Just restart your backend and it will work!** 🚀
