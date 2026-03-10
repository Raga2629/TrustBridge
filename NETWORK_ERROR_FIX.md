# 🔴 Network Error - SOLUTION

## The Problem
You're seeing "Network Error" when trying to register. This means the frontend cannot connect to the backend API.

---

## ✅ SOLUTION: Start the Backend Server

### Step 1: Open a NEW Terminal
Open a separate terminal window (don't close your frontend terminal)

### Step 2: Navigate to Backend Folder
```bash
cd trustbridge-backend
```

### Step 3: Install Dependencies (if not done)
```bash
npm install
```

### Step 4: Start the Backend Server
```bash
npm start
```

### Step 5: Wait for Success Message
You should see:
```
Server running on port 5000
MongoDB Connected: ...
```

### Step 6: Keep Backend Running
**IMPORTANT:** Keep this terminal window open! The backend must stay running.

---

## 🔍 Verify Backend is Running

### Method 1: Check Terminal
Your backend terminal should show:
```
Server running on port 5000
MongoDB Connected: cluster0.xxxxx.mongodb.net
```

### Method 2: Test in Browser
Open a new browser tab and go to:
```
http://localhost:5000
```

You should see:
```json
{"message": "TrustBridge API is running"}
```

### Method 3: Check the API Endpoint
Go to:
```
http://localhost:5000/api/auth/login
```

You should see an error (that's OK - it means the API is working):
```json
{"message": "Please provide email and password"}
```

---

## 📋 Complete Startup Checklist

### Terminal 1: Backend
```bash
cd trustbridge-backend
npm install
npm start
```
✅ Should show: "Server running on port 5000"

### Terminal 2: Frontend
```bash
cd trustbridge-v2
npm install
npm run dev
```
✅ Should show: "Local: http://localhost:5173"

### Browser
```
http://localhost:5173
```
✅ Should show: TrustBridge website

---

## 🐛 Common Issues & Solutions

### Issue 1: "Port 5000 already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Issue 2: "MongoDB connection failed"
**Solution:**
1. Check your `.env` file in `trustbridge-backend`
2. Make sure `MONGO_URI` is set correctly
3. Verify your MongoDB Atlas cluster is running

### Issue 3: "Cannot find module"
**Solution:**
```bash
cd trustbridge-backend
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Backend starts but immediately crashes
**Solution:**
Check for errors in the terminal. Common causes:
- Missing `.env` file
- Invalid MongoDB URI
- Missing dependencies

---

## 📝 Create .env File (If Missing)

Create a file named `.env` in `trustbridge-backend` folder:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/trustbridge?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

**Replace:**
- `your-username` with your MongoDB username
- `your-password` with your MongoDB password
- `cluster0.xxxxx` with your actual cluster URL

---

## 🎯 Quick Fix Commands

### Start Everything Fresh

**Terminal 1 (Backend):**
```bash
cd trustbridge-backend
npm install
npm start
```

**Terminal 2 (Frontend):**
```bash
cd trustbridge-v2
npm install
npm run dev
```

**Keep both terminals running!**

---

## ✅ How to Know It's Working

### Backend Terminal Shows:
```
Server running on port 5000
MongoDB Connected: cluster0.xxxxx.mongodb.net
```

### Frontend Terminal Shows:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Browser Console Shows:
- No "Network Error" messages
- API calls succeed (check Network tab in DevTools)

---

## 🚀 After Backend is Running

1. **Refresh your browser** (F5)
2. **Try registering again**
3. **Check backend terminal** for logs:
   ```
   === USER REGISTRATION DEBUG ===
   Request body: { name: 'Saniya', email: 'saniya@gmail.com', ... }
   ```

---

## 💡 Pro Tips

1. **Always run backend first**, then frontend
2. **Keep both terminals open** while developing
3. **Check backend logs** when something fails
4. **Use different terminal windows** for backend and frontend
5. **Don't close terminals** - minimize them instead

---

## 🆘 Still Not Working?

### Check These:

1. **Is MongoDB running?**
   - Login to MongoDB Atlas
   - Check cluster status

2. **Is .env file correct?**
   - Check MONGO_URI
   - Check JWT_SECRET

3. **Are dependencies installed?**
   ```bash
   cd trustbridge-backend
   npm install
   ```

4. **Is port 5000 free?**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Mac/Linux
   lsof -i :5000
   ```

5. **Check firewall/antivirus**
   - Allow Node.js through firewall
   - Temporarily disable antivirus

---

## 📞 Need More Help?

Share these details:
1. **Backend terminal output** (full text)
2. **Frontend terminal output** (full text)
3. **Browser console errors** (F12 → Console tab)
4. **Network tab errors** (F12 → Network tab)

---

## ✨ Expected Result

After starting the backend:
- ✅ No more "Network Error"
- ✅ Registration form submits successfully
- ✅ Backend logs show registration attempts
- ✅ You can register and login

**The backend MUST be running for the app to work!** 🚀
