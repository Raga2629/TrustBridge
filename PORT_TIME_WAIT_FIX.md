# ✅ Port 5000 Status: TIME_WAIT

## Good News!

The port is in **TIME_WAIT** state, not actively in use. This means:
- The previous process has already stopped
- The OS is just waiting to fully release the port
- This will clear automatically in 30-60 seconds

## What You See
```
TCP    [::1]:5000    [::1]:52543    TIME_WAIT    0
```

The `0` at the end means no active process is holding it.

---

## Solution: Just Wait and Retry

### Option 1: Wait 30 Seconds (Recommended)
1. Wait 30-60 seconds
2. Try starting the backend again:
   ```cmd
   npm start
   ```

### Option 2: Use a Different Port (Quick Fix)
If you don't want to wait, temporarily use port 5001:

**Edit `server.js`:**
```javascript
const PORT = process.env.PORT || 5001;
```

Then start:
```cmd
npm start
```

**Don't forget to update frontend API URL to:**
```javascript
// trustbridge-v2/src/api/axios.js
baseURL: 'http://localhost:5001'
```

---

## Why TIME_WAIT Happens

When a server closes:
1. The process stops immediately
2. The OS keeps the port in TIME_WAIT for 30-120 seconds
3. This prevents new connections from mixing with old ones
4. It's a normal TCP/IP behavior

---

## Try Now

Just run this again (should work now):
```cmd
npm start
```

If it still fails, wait another 30 seconds and try again.

---

## Alternative: Kill All Node Processes

If you're impatient:
```cmd
taskkill /IM node.exe /F
```

Then:
```cmd
npm start
```

---

**The backend should start successfully in a moment!**
