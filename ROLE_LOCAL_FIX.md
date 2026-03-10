# Role LOCAL Authorization Fix

## Issue
You're seeing: **"Role LOCAL is not authorized to access this route"**

## Cause
You're logged in with role "LOCAL" but the system expects "LOCAL_RESIDENT"

## Solution

### Option 1: Logout and Login Again (Recommended)
1. Click the **Logout** button
2. Login again with your credentials
3. The system should redirect you correctly

### Option 2: Clear Browser Storage
1. Press **F12** to open DevTools
2. Go to **Application** tab
3. Click **Local Storage** → `http://localhost:5173`
4. Click **Clear All**
5. Refresh the page
6. Login again

### Option 3: Fix Your User Role in Database

If you need to fix the role in the database, you can run this in MongoDB:

```javascript
// Connect to MongoDB
use trustbridge

// Update user role from LOCAL to LOCAL_RESIDENT
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "LOCAL_RESIDENT" } }
)
```

## Valid Roles in System

- **USER** - Regular users who book services
- **PROVIDER** - Service providers
- **LOCAL_RESIDENT** - Local residents who help newcomers
- **ADMIN** - Administrators

## Quick Fix Command

Run this in your terminal (in trustbridge-backend folder):

```bash
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await User.updateMany(
    { role: 'LOCAL' },
    { \$set: { role: 'LOCAL_RESIDENT' } }
  );
  console.log('Updated', result.modifiedCount, 'users');
  process.exit(0);
});
"
```

This will update all users with role "LOCAL" to "LOCAL_RESIDENT".

## After Fix

1. Logout
2. Login again
3. You should be redirected to the correct dashboard
