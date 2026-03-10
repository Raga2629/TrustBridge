# 🚀 Quick Start: Backend Server

## The Issue
You're getting "Network Error" because the backend server is not running.

---

## ⚡ QUICK FIX (3 Steps)

### Step 1: Open Terminal in Backend Folder
```bash
cd trustbridge-backend
```

### Step 2: Start the Server
```bash
npm start
```

### Step 3: Wait for This Message
```
Server running on port 5000
MongoDB Connected: cluster0.xxxxx.mongodb.net
```

**✅ Done! Keep this terminal open.**

---

## 🔍 Verify It's Working

Open browser and go to:
```
http://localhost:5000
```

You should see:
```json
{"message": "TrustBridge API is running"}
```

---

## 🎯 Now Try Registration Again

1. Go back to your registration page
2. Refresh the page (F5)
3. Fill the form
4. Click "Register as Local Resident"
5. **It should work now!**

---

## 📋 Both Servers Must Run

You need TWO terminal windows:

**Terminal 1: Backend**
```bash
cd trustbridge-backend
npm start
```
Keep running ✅

**Terminal 2: Frontend**
```bash
cd trustbridge-v2
npm run dev
```
Keep running ✅

---

## ⚠️ Common Mistake

**DON'T close the backend terminal!**

The backend must stay running while you use the app.

---

## 🆘 If Backend Won't Start

### Missing Dependencies?
```bash
cd trustbridge-backend
npm install
npm start
```

### Port Already in Use?
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Error?
Check your `.env` file has correct `MONGO_URI`

---

## ✨ Success Indicators

### Backend Terminal:
```
✅ Server running on port 5000
✅ MongoDB Connected
```

### Browser:
```
✅ No "Network Error"
✅ Registration works
```

### Backend Logs:
```
=== USER REGISTRATION DEBUG ===
Request body: { name: 'Saniya', ... }
✅ User created successfully
```

---

**Start the backend, keep it running, and try again!** 🚀
