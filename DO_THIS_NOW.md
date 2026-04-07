# ⚡ DO THIS NOW - One Command Fix

## Your Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

## The Fix (One Command)
```cmd
net start MongoDB
```

## That's It!

Your backend will automatically reconnect. Watch your terminal for:
```
MongoDB Connected: 127.0.0.1
```

---

## If That Doesn't Work

### Try This
```cmd
check-mongodb.bat
```

This will tell you exactly what's wrong.

---

## Then Start Frontend
```cmd
cd trustbridge-v2
npm run dev
```

---

## Then Test
Go to: http://localhost:5173/login

---

## Need More Help?

- **MongoDB not installed?** → See `MONGODB_FIX.md`
- **Visual explanation?** → See `MONGODB_STATUS_VISUAL.md`
- **Complete guide?** → See `FIX_MONGODB_NOW.md`

---

## Quick Checklist

- [ ] Run: `net start MongoDB`
- [ ] See: "MongoDB Connected: 127.0.0.1" in backend terminal
- [ ] Run: `cd trustbridge-v2 && npm run dev`
- [ ] Open: http://localhost:5173
- [ ] Test: Login works!

---

**Everything else is already working. Just start MongoDB!** 🚀
