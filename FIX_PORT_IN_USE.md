# 🔧 Fix Port Already In Use Error

## Problem
```
Error: listen EADDRINUSE: address already in use :::5000
```

The backend server is already running on port 5000.

---

## Solution: Stop the Existing Process

### Option 1: Find and Kill the Process (Recommended)

**Step 1: Find the process using port 5000**
```cmd
netstat -ano | findstr :5000
```

You'll see output like:
```
TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    12345
```

The last number (12345) is the Process ID (PID).

**Step 2: Kill the process**
```cmd
taskkill /PID 12345 /F
```

Replace `12345` with the actual PID from step 1.

**Step 3: Start the backend again**
```cmd
npm start
```

---

### Option 2: Use PowerShell (Alternative)

**Step 1: Open PowerShell in the backend folder**

**Step 2: Find and kill the process**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

**Step 3: Start the backend**
```cmd
npm start
```

---

### Option 3: Close All Node Processes

**If you're not sure which process it is:**

```cmd
taskkill /IM node.exe /F
```

This kills ALL Node.js processes. Then restart:
```cmd
npm start
```

---

## Quick Command (Copy-Paste)

Run this in Command Prompt in the backend folder:

```cmd
FOR /F "tokens=5" %P IN ('netstat -ano ^| findstr :5000') DO taskkill /PID %P /F & npm start
```

---

## Verify Backend is Running

After starting, you should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

---

## Why This Happens

- You started the backend before and didn't stop it
- The terminal was closed but the process kept running
- A previous crash left the process running

---

## Prevention

Always stop the backend properly:
- Press `Ctrl + C` in the terminal
- Wait for "Server stopped" message
- Don't just close the terminal window

---

## Test After Fix

1. Backend should start successfully
2. Visit: http://localhost:5000
3. Should see: "TrustBridge API is running"

---

**Now try the commands above to stop the existing process and restart!**
