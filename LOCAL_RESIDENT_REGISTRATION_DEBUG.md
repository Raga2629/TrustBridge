# Local Resident Registration Issue - Debug Guide

## Problem

User trying to register as Local Resident gets error:
```
Registration failed. Please try again.
```

Backend shows 500 Internal Server Error.

## Possible Causes

### 1. Email Already Exists
The email "sreehani@gmail.com" might already be registered in the database.

**Solution**: Try with a different email or delete the existing user from database.

### 2. Database Connection Issue
MongoDB might not be connected properly.

**Check**: Look at backend console for MongoDB connection errors.

### 3. File Upload Issue
The uploads directory might not exist or have permission issues.

**Check**: 
```bash
# Check if directory exists
ls -la uploads/resident-proofs

# Create if missing
mkdir -p uploads/resident-proofs
chmod 755 uploads/resident-proofs
```

### 4. Missing Environment Variables
JWT_SECRET or MONGO_URI might not be set.

**Check**: `.env` file in trustbridge-backend folder.

## Improved Error Logging

I've added detailed logging to the backend. Now when registration fails, you'll see:

```
=== RESIDENT REGISTRATION DEBUG ===
Request body: { city, area, yearsStaying, agreeToTerms }
Uploaded file: { filename, path, size }
User from token: { _id, name, email }
```

Then it will show exactly which step failed:
- ❌ Validation failed: Missing required fields
- ❌ Validation failed: No file uploaded
- ❌ Validation failed: Terms not agreed
- ❌ Validation failed: Invalid years staying
- ❌ User already registered as resident
- ✅ All validations passed, creating resident profile...
- ✅ User role updated to LOCAL_RESIDENT
- ✅ Resident profile created
- ✅ Registration complete!

## How to Debug

### Step 1: Check Backend Console
Restart the backend and watch the console output:
```bash
cd trustbridge-backend
npm start
```

### Step 2: Try Registration Again
Fill the form and submit. Watch the backend console for detailed logs.

### Step 3: Check for Specific Errors

**If you see "User already exists":**
- The email is already registered
- Try a different email
- Or delete the user from database

**If you see "File upload error":**
- Check uploads directory exists
- Check file size (must be < 5MB)
- Check file type (only .jpg, .jpeg, .png, .pdf allowed)

**If you see "ValidationError":**
- Check all required fields are filled
- Check yearsStaying is a valid number

**If you see "MongoError":**
- Check MongoDB is running
- Check MONGO_URI in .env file

## Common Solutions

### Solution 1: Clear Existing User
If email already exists, delete from database:
```javascript
// In MongoDB or using a script
db.users.deleteOne({ email: "sreehani@gmail.com" });
db.residents.deleteOne({ user: ObjectId("...") });
```

### Solution 2: Check File Upload
Make sure file is being uploaded:
```javascript
// In LocalResidentSignup.jsx
console.log('File selected:', formData.proofDocument);
console.log('File name:', formData.proofDocument?.name);
console.log('File size:', formData.proofDocument?.size);
```

### Solution 3: Verify Token
Make sure token is being sent:
```javascript
// In LocalResidentSignup.jsx
console.log('Token:', token);
console.log('Authorization header:', `Bearer ${token}`);
```

## Testing Checklist

- [ ] Backend server is running
- [ ] MongoDB is connected
- [ ] .env file has all required variables
- [ ] uploads/resident-proofs directory exists
- [ ] Email is unique (not already registered)
- [ ] All form fields are filled
- [ ] File is selected and < 5MB
- [ ] File type is .jpg, .jpeg, .png, or .pdf
- [ ] Terms checkbox is checked

## Expected Flow

1. User fills registration form
2. Frontend sends POST to `/auth/register`
   - Creates User account
   - Returns JWT token
3. Frontend sends POST to `/residents/register` with token
   - Uploads proof document
   - Creates Resident profile
   - Sets verificationStatus to PENDING
4. User redirected to verification pending page

## Files Modified

- `trustbridge-backend/controllers/residentController.js` - Added detailed logging

## Next Steps

1. **Restart backend server** to apply logging changes
2. **Try registration again** and watch console
3. **Share the backend console output** if still failing
4. Based on the specific error, we can fix it

## Status

✅ **Improved error logging added**
⏳ **Waiting for backend console output to diagnose specific issue**
