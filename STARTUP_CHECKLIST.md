# ✅ TrustBridge Startup Checklist

## Before You Start

Make sure you have:
- [ ] Node.js installed
- [ ] MongoDB Atlas account
- [ ] `.env` file in `trustbridge-backend` folder

---

## 🚀 Startup Steps

### 1️⃣ Start Backend (FIRST!)

**Open Terminal 1:**
```bash
cd trustbridge-backend
npm start
```

**Wait for:**
```
✅ Server running on port 5000
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

**Keep this terminal OPEN!**

---

### 2️⃣ Start Frontend (SECOND!)

**Open Terminal 2:**
```bash
cd trustbridge-v2
npm run dev
```

**Wait for:**
```
✅ Local: http://localhost:5173/
```

**Keep this terminal OPEN!**

---

### 3️⃣ Open Browser

Go to:
```
http://localhost:5173
```

**You should see TrustBridge website!**

---

## 🔍 Verify Everything Works

### Test 1: Backend API
Open: `http://localhost:5000`

**Expected:**
```json
{"message": "TrustBridge API is running"}
```

### Test 2: Frontend
Open: `http://localhost:5173`

**Expected:**
- TrustBridge homepage loads
- No "Network Error" in console

### Test 3: Registration
1. Go to Local Resident Registration
2. Fill the form
3. Click Register

**Expected:**
- No "Network Error"
- Backend terminal shows logs
- Registration succeeds or shows specific error

---

## 🐛 Troubleshooting

### ❌ "Network Error"
**Cause:** Backend not running

**Fix:**
```bash
cd trustbridge-backend
npm start
```

### ❌ "Port 5000 already in use"
**Fix:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### ❌ "MongoDB connection failed"
**Fix:** Check `.env` file has correct `MONGO_URI`

### ❌ "Cannot find module"
**Fix:**
```bash
cd trustbridge-backend
npm install
```

---

## 📝 .env File Template

Create `.env` in `trustbridge-backend`:

```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/trustbridge
JWT_SECRET=your-secret-key-change-this
PORT=5000
NODE_ENV=development
```

---

## ✨ Success Checklist

- [ ] Backend terminal shows "Server running on port 5000"
- [ ] Backend terminal shows "MongoDB Connected"
- [ ] Frontend terminal shows "Local: http://localhost:5173"
- [ ] Browser opens TrustBridge website
- [ ] No "Network Error" in browser console
- [ ] Registration form works

---

## 💡 Important Notes

1. **Always start backend BEFORE frontend**
2. **Keep BOTH terminals running**
3. **Don't close terminals** while using the app
4. **Check backend logs** when debugging
5. **Refresh browser** after starting backend

---

## 🎯 Quick Commands

### Start Backend
```bash
cd trustbridge-backend && npm start
```

### Start Frontend
```bash
cd trustbridge-v2 && npm run dev
```

### Check Backend Status
```bash
curl http://localhost:5000
```

### Kill Port 5000
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

---

## 🆘 Still Having Issues?

1. **Restart everything:**
   - Close both terminals
   - Start backend first
   - Then start frontend
   - Refresh browser

2. **Clear cache:**
   - Browser: Ctrl+Shift+Delete
   - Node modules: `rm -rf node_modules && npm install`

3. **Check logs:**
   - Backend terminal
   - Browser console (F12)
   - Network tab (F12)

---

**Both servers must be running for the app to work!** 🚀
