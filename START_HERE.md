# 🎯 START HERE - TrustBridge Quick Setup

## 🚀 Easiest Way to Start

### Option 1: Use Batch Script (Recommended)
Double-click: `start-trustbridge.bat`

This will:
- Stop any running Node processes
- Check/start MongoDB
- Start backend server
- Start frontend server

### Option 2: Manual Start
See `QUICK_START_SERVERS.md` for detailed steps.

## ✅ What to Expect

### Backend Terminal
```
Server running on port 5000
MongoDB Connected: 127.0.0.1
```

### Frontend Terminal
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

## 🧪 Test Your Setup

### 1. Open Browser
Go to: `http://localhost:5173`

### 2. Test Role Selection
- Click "Sign Up" button
- Should see beautiful role selection page
- No scrollbars, smooth animations
- Choose any role to continue

### 3. Test Login
- Create account or use existing credentials
- Should successfully login and redirect to dashboard

### 4. Test AI Spam Detection
Go to any service → Submit review:

**Fake Review (will be BLOCKED):**
```
Super college!!!! 😊😊😊😊😊❤
```

**Genuine Review (will be ACCEPTED):**
```
I stayed here for 2 months. The rooms are clean and the owner is helpful. Good location near the metro station.
```

## 🛑 Stop Servers

### Option 1: Use Batch Script
Double-click: `stop-trustbridge.bat`

### Option 2: Manual Stop
```cmd
taskkill /F /IM node.exe
```

## 📋 Current Features

### ✅ Completed & Working
- Beautiful Role Selection page (no scrollbars)
- Login/Signup flow with role-based routing
- AI Review Spam Detection (blocks fake reviews automatically)
- AI Document Verification (for service providers)
- Admin Dashboard with verification controls
- Service Provider Dashboard
- Local Resident System
- Community Forum
- Secure Chat between users
- Booking System
- Review System with AI analysis

### 🎨 UI Improvements
- Modern, attractive role selection page
- Smooth animations and hover effects
- Professional color scheme
- Responsive design
- No scrollbars on role selection

### 🤖 AI Systems
1. **Review Spam Detector**
   - Analyzes text patterns
   - Checks sentiment authenticity
   - Detects behavioral anomalies
   - Blocks fake reviews (95%+ confidence)
   - Flags suspicious reviews for manual review

2. **Document Verifier**
   - Fuzzy matching for business names
   - Owner name verification
   - Registration number validation
   - Address similarity check
   - Fraud pattern detection

## 🔧 Troubleshooting

### "ERR_CONNECTION_REFUSED"
Backend not running. Start it:
```cmd
cd trustbridge-backend
npm start
```

### "MongoDB connection error"
Start MongoDB:
```cmd
net start MongoDB
```

### "Port 5000 already in use"
Stop all Node processes:
```cmd
taskkill /F /IM node.exe
```

### Backend crashes on start
Check the error message. Common issues:
- MongoDB not running
- Missing dependencies: `npm install`
- Port conflict

## 📁 Project Structure

```
TrustBridge/
├── trustbridge-backend/     # Express.js API
│   ├── server.js           # Main server file
│   ├── controllers/        # Business logic
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   └── utils/             # AI systems
│
├── trustbridge-v2/         # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── styles/        # CSS files
│   │   └── context/       # Auth context
│   └── public/
│
├── start-trustbridge.bat   # Start both servers
├── stop-trustbridge.bat    # Stop all servers
└── START_HERE.md          # This file
```

## 🎓 User Roles

### 1. Newcomer (USER)
- Browse services
- Book accommodations
- Submit reviews (AI-checked)
- Chat with providers
- Use community forum

### 2. Service Provider (SERVICE_PROVIDER)
- Add services
- Manage bookings
- Upload business documents (AI-verified)
- Respond to reviews
- Chat with customers

### 3. Local Resident (LOCAL_RESIDENT)
- Verify as trusted local
- Help newcomers
- Provide local insights
- Earn trust score

### 4. Admin (ADMIN)
- Verify users and services
- Review AI-flagged content
- Manage complaints
- Monitor platform activity

## 📞 Need More Help?

- **Backend Issues**: Check `trustbridge-backend/server.js` logs
- **Frontend Issues**: Check browser console (F12)
- **MongoDB Issues**: Check MongoDB Compass or `mongosh`
- **AI Systems**: See `AI_SYSTEMS_TESTING_GUIDE.md`

## 🎉 You're Ready!

Everything is set up. Just run `start-trustbridge.bat` and start testing!
