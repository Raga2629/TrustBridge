# 🔐 Administrator Privileges Required

## Your Error
```
System error 5 has occurred.
Access is denied.
```

This means you need to run the command as Administrator.

## ✅ Solution 1: Run PowerShell as Administrator (Recommended)

### Step 1: Close Current Terminal

### Step 2: Open PowerShell as Administrator
1. Press `Windows Key`
2. Type: `PowerShell`
3. **Right-click** on "Windows PowerShell"
4. Click **"Run as administrator"**
5. Click "Yes" when prompted

### Step 3: Start MongoDB
```powershell
net start MongoDB
```

### Step 4: Navigate to Backend
```powershell
cd D:\TrustBridge\trustbridge-backend
npm run dev
```

You should now see:
```
MongoDB Connected: 127.0.0.1
```

---

## ✅ Solution 2: Use MongoDB Compass (No Admin Needed)

### Step 1: Open MongoDB Compass
- Find MongoDB Compass in your Start Menu
- Or search for "MongoDB Compass"

### Step 2: Click Connect
- It will automatically start MongoDB
- Connect to: `mongodb://localhost:27017`

### Step 3: Backend Auto-Reconnects
Watch your backend terminal - it will automatically show:
```
MongoDB Connected: 127.0.0.1
```

---

## ✅ Solution 3: Start MongoDB Manually (No Admin Needed)

### Step 1: Create Data Directory (if not exists)
```cmd
mkdir C:\data\db
```

### Step 2: Start MongoDB Manually
```cmd
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

**Note:** Adjust the path based on your MongoDB version (might be 6.0, 7.0, 8.0, etc.)

### Step 3: Keep This Terminal Open
This terminal must stay open while using TrustBridge.

### Step 4: Backend Auto-Reconnects
Your backend will automatically connect.

---

## ✅ Solution 4: Updated Batch Script (Run as Admin)

I'll create a batch script that requests admin privileges automatically.

---

## 🎯 Recommended Approach

**Use Solution 2 (MongoDB Compass)** - It's the easiest and doesn't require admin privileges!

1. Open MongoDB Compass
2. Click "Connect"
3. Watch your backend terminal auto-reconnect
4. Start frontend
5. Done!

---

## After MongoDB Starts

### Your Backend Terminal Will Show:
```
[nodemon] restarting due to changes...
[nodemon] starting `node server.js`
Server running on port 5000
MongoDB Connected: 127.0.0.1  ← Success!
```

### Then Start Frontend (New Terminal):
```cmd
cd D:\TrustBridge\trustbridge-v2
npm run dev
```

---

## Quick Comparison

| Method | Admin Required? | Easiest? |
|--------|----------------|----------|
| net start MongoDB | ✅ Yes | Medium |
| MongoDB Compass | ❌ No | ✅ Easiest |
| Manual mongod | ❌ No | Medium |

---

## Troubleshooting

### Can't find MongoDB Compass?
Download from: https://www.mongodb.com/try/download/compass

### Can't find mongod.exe?
Check these locations:
- `C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe`
- `C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe`
- `C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe`

### Still having issues?
Use the manual method (Solution 3) - it always works!

---

## Next Steps

1. Choose one of the solutions above
2. Start MongoDB
3. Watch backend auto-reconnect
4. Start frontend: `cd trustbridge-v2 && npm run dev`
5. Test at http://localhost:5173

---

**Easiest: Just open MongoDB Compass and click Connect!** 🚀
