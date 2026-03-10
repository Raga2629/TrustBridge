# 🔄 TrustBridge Connection Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                   http://localhost:5173                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│                   Port: 5173 (Development)                   │
│                                                              │
│  Components:                                                 │
│  ├── Login.jsx                                              │
│  ├── RoleSelection.jsx (Beautiful UI ✨)                    │
│  ├── Dashboard.jsx                                          │
│  └── AuthContext.jsx (Manages auth state)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ API Calls (axios)
                         │ http://localhost:5000/api/*
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Express.js)                       │
│                        Port: 5000                            │
│                                                              │
│  Routes:                                                     │
│  ├── /api/auth/login          → authController.login       │
│  ├── /api/auth/register       → authController.register    │
│  ├── /api/services/*          → serviceController          │
│  ├── /api/reviews/*           → reviewController           │
│  ├── /api/review-analysis/*   → AI Spam Detector 🤖        │
│  └── /api/document-verification/* → AI Doc Verifier 🤖     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Database Queries
                         │ mongodb://127.0.0.1:27017
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
│                   Port: 27017 (Default)                      │
│                                                              │
│  Collections:                                                │
│  ├── users          (Login credentials, roles)              │
│  ├── services       (Accommodations, listings)              │
│  ├── reviews        (With AI analysis data)                 │
│  ├── bookings       (Reservations)                          │
│  ├── residents      (Local resident data)                   │
│  └── serviceproviders (Business documents)                  │
└─────────────────────────────────────────────────────────────┘
```

## Login Flow Diagram

```
User enters credentials
        │
        ▼
┌───────────────────┐
│  Login.jsx        │
│  (Frontend)       │
└────────┬──────────┘
         │
         │ POST /api/auth/login
         │ { email, password }
         │
         ▼
┌───────────────────┐
│ authController.js │
│  (Backend)        │
└────────┬──────────┘
         │
         │ Query user by email
         │
         ▼
┌───────────────────┐
│   MongoDB         │
│   users collection│
└────────┬──────────┘
         │
         │ Return user data
         │
         ▼
┌───────────────────┐
│ authController.js │
│ Verify password   │
│ Generate JWT      │
└────────┬──────────┘
         │
         │ Return: { user, token }
         │
         ▼
┌───────────────────┐
│  AuthContext.jsx  │
│  Store in:        │
│  - localStorage   │
│  - React state    │
└────────┬──────────┘
         │
         │ Redirect based on role
         │
         ▼
┌───────────────────┐
│   Dashboard       │
│   (Role-based)    │
└───────────────────┘
```

## AI Review Spam Detection Flow

```
User submits review
        │
        ▼
┌───────────────────────┐
│  reviewController.js  │
│  createReview()       │
└────────┬──────────────┘
         │
         │ Call AI analyzer
         │
         ▼
┌───────────────────────┐
│ reviewSpamDetector.js │
│ Analyze:              │
│ - Text patterns       │
│ - Sentiment           │
│ - Behavior            │
│ - Similarity          │
└────────┬──────────────┘
         │
         │ Return classification
         │
         ▼
    ┌────────┐
    │ Result │
    └───┬────┘
        │
    ┌───┴────────────────────────┐
    │                            │
    ▼                            ▼
┌─────────┐              ┌──────────────┐
│  FAKE   │              │   GENUINE    │
│ (95%+)  │              │   or         │
│         │              │ SUSPICIOUS   │
│ BLOCKED │              │              │
│ ❌      │              │ SAVED ✅     │
└─────────┘              └──────────────┘
```

## Connection Error Troubleshooting

### ERR_CONNECTION_REFUSED
```
Frontend (5173) ──X──> Backend (5000)
                       ↑
                       Backend not running!
```

**Solution:**
```cmd
cd trustbridge-backend
npm start
```

### MongoDB Connection Error
```
Backend (5000) ──X──> MongoDB (27017)
                      ↑
                      MongoDB not running!
```

**Solution:**
```cmd
net start MongoDB
```

### Port Already in Use
```
New Backend ──X──> Port 5000
                   ↑
                   Old process still running!
```

**Solution:**
```cmd
taskkill /F /IM node.exe
```

## Successful Connection

```
┌──────────┐     ✅      ┌──────────┐     ✅      ┌──────────┐
│ Frontend │ ─────────> │ Backend  │ ─────────> │ MongoDB  │
│  :5173   │ <───────── │  :5000   │ <───────── │  :27017  │
└──────────┘            └──────────┘            └──────────┘
     │                       │                       │
     │                       │                       │
   React                  Express                 Database
   Vite                   Node.js                 MongoDB
```

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 5000 | http://localhost:5000 |
| MongoDB | 27017 | mongodb://127.0.0.1:27017 |

## Environment Variables

Backend `.env` file:
```env
MONGO_URI=mongodb://127.0.0.1:27017/trustbridge
PORT=5000
JWT_SECRET=trustbridge_secret_key
```

Frontend `axios.js` config:
```javascript
baseURL: 'http://localhost:5000/api'
```

## Health Check Commands

### Check Backend
```cmd
curl http://localhost:5000
```
Should return: `{"message":"TrustBridge API is running"}`

### Check MongoDB
```cmd
mongosh --eval "db.version()"
```
Should return MongoDB version

### Check Frontend
Open browser: `http://localhost:5173`
Should show TrustBridge homepage

## Quick Diagnostics

### Backend not responding?
1. Check if process is running: `netstat -ano | findstr :5000`
2. Check logs in backend terminal
3. Verify MongoDB connection
4. Check `.env` file exists

### Frontend can't connect?
1. Check backend is running on port 5000
2. Check browser console (F12) for errors
3. Verify axios baseURL configuration
4. Check CORS settings in backend

### Login fails?
1. Check user exists in database
2. Verify password is correct
3. Check JWT_SECRET in `.env`
4. Check authController logs

## Success Indicators

✅ Backend terminal shows:
```
Server running on port 5000
MongoDB Connected: 127.0.0.1
```

✅ Frontend terminal shows:
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

✅ Browser shows:
- TrustBridge homepage loads
- Can navigate to login/signup
- Role selection page works
- No console errors

✅ Login works:
- Credentials accepted
- Token stored in localStorage
- Redirects to dashboard
- User data available in AuthContext
