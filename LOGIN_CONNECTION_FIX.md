# 🔧 Login Connection Issue - FIXED

## Problem
- Frontend shows `ERR_CONNECTION_REFUSED` error
- Cannot connect to `http://localhost:5000/api/auth/login`
- Backend server not responding

## Solution Steps

### Step 1: Stop All Node Processes
```cmd
taskkill /F /IM node.exe
```

### Step 2: Verify MongoDB is Running
MongoDB must be running on `mongodb://127.0.0.1:27017/trustbridge`

Check if MongoDB is running:
```cmd
mongosh --eval "db.version()"
```

If not running, start MongoDB service:
```cmd
net start MongoDB
```

### Step 3: Start Backend Server
```cmd
cd trustbridge-backend
npm start
```

You should see:
```
Server running on port 5000
MongoDB Connected: 127.0.0.1
```

### Step 4: Start Frontend (in new terminal)
```cmd
cd trustbridge-v2
npm run dev
```

### Step 5: Test Login
1. Go to `http://localhost:5173/login`
2. Try logging in with existing credentials
3. Or create a new account via role selection

## Test User Creation (Optional)

If you need a test user, run:
```cmd
cd trustbridge-backend
node createTestUser.js
```

## Verification Checklist
- ✅ MongoDB service is running
- ✅ Backend shows "Server running on port 5000"
- ✅ Backend shows "MongoDB Connected"
- ✅ Frontend is accessible at localhost:5173
- ✅ No ERR_CONNECTION_REFUSED errors

## Common Issues

### Issue: MongoDB not installed
Install MongoDB Community Edition from: https://www.mongodb.com/try/download/community

### Issue: Port 5000 already in use
Check what's using port 5000:
```cmd
netstat -ano | findstr :5000
```

Kill the process:
```cmd
taskkill /F /PID <process_id>
```

### Issue: Backend crashes on start
Check for syntax errors in route files, especially:
- `routes/documentVerificationRoutes.js`
- All controller files

## Current Configuration
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- MongoDB: `mongodb://127.0.0.1:27017/trustbridge`
- JWT Secret: Configured in `.env`

## Next Steps After Fix
1. Test login with existing user
2. Test registration flow
3. Test AI spam detection on reviews
4. Test document verification system
