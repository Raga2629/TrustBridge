# ⚡ QUICK FIX - Stop Old Server & Restart

## Problem
Your old server is still running, so the new AI code isn't loaded.

## Solution (2 Steps)

### Step 1: Stop Old Server

**Run this command:**
```bash
taskkill /F /IM node.exe
```

**OR double-click this file:**
```
trustbridge-backend/stopServer.bat
```

### Step 2: Start New Server

```bash
cd trustbridge-backend
npm start
```

---

## ✅ That's It!

Now test the fake review again:
- Submit: "Super college!!!! 😊😊😊😊😊❤"
- Expected: ❌ **BLOCKED** with error message

---

## 🎯 What Will Happen After Restart

### Before (Old Server):
```
User submits: "Super college!!!! 😊😊😊😊😊❤"
Result: ✅ Review posted (NO AI CHECK)
```

### After (New Server):
```
User submits: "Super college!!!! 😊😊😊😊😊❤"
AI Analysis: Fake (95% confidence)
Result: ❌ BLOCKED - "Your review appears to be spam or fake..."
```

---

## 🔍 Verify It's Working

After restart, check your server console. When someone submits a review, you should see:

```
🤖 AI Analysis Result: {
  classification: 'Fake',
  confidence: '95%',
  riskLevel: 'High'
}
🚫 AI detected FAKE review - BLOCKING
```

---

## 📝 Quick Commands

```bash
# Stop server
taskkill /F /IM node.exe

# Start server
cd trustbridge-backend
npm start

# Test AI (without server)
node testFakeReview.js
```

---

**Just run these 2 commands and you're done!** 🚀
