# 🚀 Quick Start - Run TrustBridge

## Prerequisites Check
Before starting, ensure:
- ✅ MongoDB is installed and running
- ✅ Node.js is installed
- ✅ Dependencies are installed in both folders

## Step-by-Step Startup

### 1️⃣ Stop Any Running Processes
```cmd
taskkill /F /IM node.exe
```

### 2️⃣ Start MongoDB (if not running)
```cmd
net start MongoDB
```

Or if using MongoDB Compass, just open it.

### 3️⃣ Start Backend Server
Open Terminal 1:
```cmd
cd trustbridge-backend
npm start
```

Wait for these messages:
```
Server running on port 5000
MongoDB Connected: 127.0.0.1
```

### 4️⃣ Start Frontend Server
Open Terminal 2 (new terminal):
```cmd
cd trustbridge-v2
npm run dev
```

Wait for:
```
Local: http://localhost:5173/
```

### 5️⃣ Access Application
Open browser: `http://localhost:5173`

## Test the Application

### Test Login Flow
1. Click "Sign Up" → Goes to Role Selection
2. Choose a role (Newcomer/Service Provider/Local Resident)
3. Complete registration
4. Login with credentials

### Test AI Systems
1. Submit a fake review: "Super college!!!! 😊😊😊😊😊❤"
2. Should be BLOCKED by AI spam detector
3. Submit genuine review: "I stayed here for 2 months. The rooms are clean and the owner is helpful."
4. Should be ACCEPTED

## Troubleshooting

### Backend won't start
```cmd
cd trustbridge-backend
npm install
node server.js
```

### Frontend won't start
```cmd
cd trustbridge-v2
npm install
npm run dev
```

### MongoDB connection error
Check if MongoDB is running:
```cmd
mongosh --eval "db.version()"
```

### Port 5000 already in use
Find and kill the process:
```cmd
netstat -ano | findstr :5000
taskkill /F /PID <process_id>
```

## Quick Commands Reference

| Action | Command |
|--------|---------|
| Stop all Node | `taskkill /F /IM node.exe` |
| Start MongoDB | `net start MongoDB` |
| Backend | `cd trustbridge-backend && npm start` |
| Frontend | `cd trustbridge-v2 && npm run dev` |
| Check MongoDB | `mongosh --eval "db.version()"` |

## What's Working Now
✅ Role Selection page (beautiful UI, no scrollbars)
✅ Login/Signup flow
✅ AI Review Spam Detection (blocks fake reviews)
✅ AI Document Verification (for service providers)
✅ Admin dashboard
✅ Service provider dashboard
✅ Local resident system
✅ Community forum
✅ Secure chat
✅ Booking system

## Need Help?
- Backend logs show errors → Check MongoDB connection
- Frontend shows connection error → Ensure backend is running on port 5000
- Login fails → Check if user exists or create new account
