# 🔧 Fix Server Error - Quick Guide

## Error You're Seeing

```
Error: listen EADDRINUSE: address already in use :::5000
```

This means your old server is still running on port 5000.

---

## ✅ Solution: Stop Old Server First

### Option 1: Find and Stop the Process (Recommended)

**On Windows:**

1. Open Task Manager (Ctrl + Shift + Esc)
2. Go to "Details" tab
3. Find "node.exe" processes
4. Right-click → End Task
5. Try starting server again

**OR use Command:**

```bash
# Find process on port 5000
netstat -ano | findstr :5000

# You'll see something like:
# TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    12345

# Kill the process (replace 12345 with your PID)
taskkill /PID 12345 /F
```

### Option 2: Use Different Port

Edit `trustbridge-backend/.env`:

```
PORT=5001
```

Then start server:
```bash
npm start
```

---

## 🚀 Complete Restart Steps

### Step 1: Stop All Node Processes

```bash
# Windows
taskkill /F /IM node.exe

# This will stop ALL node processes
```

### Step 2: Start Backend

```bash
cd trustbridge-backend
npm start
```

### Step 3: Verify Server Started

You should see:
```
Server running on port 5000
MongoDB connected
```

### Step 4: Test Fake Review

Now try submitting the fake review again. It should be BLOCKED!

---

## 🧪 Quick Test Without Server

If you want to test AI detection without starting the server:

```bash
cd trustbridge-backend
node testFakeReview.js
```

This will show you if the AI correctly detects the fake review.

---

## ✅ After Server Restarts

1. Go to your review form
2. Submit: "Super college!!!! 😊😊😊😊😊❤"
3. Expected: ❌ Error message "Your review appears to be spam or fake..."

---

## 🔍 Verify AI is Working

Check server console logs when submitting a review:

### You should see:
```
🤖 AI Analysis Result: {
  classification: 'Fake',
  confidence: '95%',
  riskLevel: 'High'
}
🚫 AI detected FAKE review - BLOCKING
```

---

## Summary

1. ⬜ Stop old server (taskkill /F /IM node.exe)
2. ⬜ Start new server (npm start)
3. ⬜ Test fake review (should be blocked)
4. ⬜ Check console logs (should show AI analysis)

**The AI integration is ready - just need to restart the server!** 🛡️
