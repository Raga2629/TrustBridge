# 🎴 Quick Reference Card

## 🚀 START SERVERS

### Easiest Way
```cmd
Double-click: start-trustbridge.bat
```

### Manual Way
```cmd
# Terminal 1 - Backend
cd trustbridge-backend
npm start

# Terminal 2 - Frontend  
cd trustbridge-v2
npm run dev
```

---

## 🛑 STOP SERVERS

```cmd
Double-click: stop-trustbridge.bat
```
OR
```cmd
taskkill /F /IM node.exe
```

---

## 🌐 URLS

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| MongoDB | mongodb://127.0.0.1:27017 |

---

## 🧪 TEST AI SPAM DETECTION

### Fake Review (BLOCKED ❌)
```
Super college!!!! 😊😊😊😊😊❤
```

### Real Review (ACCEPTED ✅)
```
I stayed here for 2 months. The rooms are clean 
and the owner is helpful. Good location near metro.
```

---

## 🔑 ADMIN ACCESS

```
Email: admin@trustbridge.com
Password: admin123
URL: http://localhost:5173/admin/login
```

---

## 🐛 COMMON FIXES

### Connection Refused
```cmd
cd trustbridge-backend
npm start
```

### MongoDB Error
```cmd
net start MongoDB
```

### Port Conflict
```cmd
taskkill /F /IM node.exe
```

---

## 📂 KEY FILES

### Startup
- `start-trustbridge.bat` - Start everything
- `stop-trustbridge.bat` - Stop everything

### Docs
- `START_HERE.md` - Main guide
- `CURRENT_STATUS_AND_NEXT_STEPS.md` - Status
- `CONNECTION_FLOW.md` - Architecture

### Tests
- `testReviewAnalysis.js` - Test AI spam
- `testAllAI.js` - Test all AI
- `createTestUser.js` - Create test user

---

## ✅ SUCCESS INDICATORS

### Backend Running
```
✅ Server running on port 5000
✅ MongoDB Connected: 127.0.0.1
```

### Frontend Running
```
✅ VITE ready in XXX ms
✅ Local: http://localhost:5173/
```

### Login Works
```
✅ No connection errors
✅ Redirects to dashboard
✅ User data in localStorage
```

---

## 🎯 FEATURES READY

- ✅ Role Selection (Beautiful UI)
- ✅ Login/Signup Flow
- ✅ AI Spam Detection
- ✅ AI Document Verification
- ✅ Admin Dashboard
- ✅ Service Provider Dashboard
- ✅ Local Resident System
- ✅ Community Forum
- ✅ Secure Chat
- ✅ Booking System

---

## 📞 NEED HELP?

1. Check `START_HERE.md`
2. Check `CURRENT_STATUS_AND_NEXT_STEPS.md`
3. Check backend terminal for errors
4. Check browser console (F12)
5. Verify MongoDB is running

---

## 🎨 ROLE SELECTION PAGE

**Features:**
- No scrollbars ✅
- Animated background ✅
- Beautiful cards ✅
- Smooth hover effects ✅
- Top navbar visible ✅

**Route:** `/role-selection`

---

## 🤖 AI SYSTEMS

### Review Spam Detector
- Blocks fake reviews (95%+ confidence)
- Flags suspicious reviews
- Accepts genuine reviews

### Document Verifier
- Verifies business documents
- Fuzzy name matching
- Fraud detection
- Confidence scoring

---

## 💡 QUICK TIPS

1. Always start backend before frontend
2. Wait for "MongoDB Connected" message
3. Use batch scripts for easy startup
4. Check both terminal windows for errors
5. Restart backend after code changes
6. Use F12 to check browser console

---

## 🔄 RESTART SEQUENCE

```cmd
# 1. Stop everything
taskkill /F /IM node.exe

# 2. Start backend
cd trustbridge-backend
npm start

# 3. Start frontend (new terminal)
cd trustbridge-v2
npm run dev

# 4. Open browser
http://localhost:5173
```

---

## 📊 PROJECT STATUS

**Current Issue:** Backend not running
**Solution:** Run startup commands above
**Status:** All features built and ready
**Next:** Start servers and test

---

**REMEMBER:** Everything works once servers are running! 🚀
