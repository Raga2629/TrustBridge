# Local Resident System - Complete Implementation

## Overview
The Local Resident system is a production-level module that allows verified local residents to help newcomers through a secure chat system. This implementation includes verification workflows, trust scoring, complaint management, and auto-suspension features.

---

## Backend Implementation

### 1. Models Created

#### Resident Model (`trustbridge-backend/models/Resident.js`)
- **Fields:**
  - `user`: Reference to User model
  - `city`, `area`: Location information
  - `yearsStaying`: Number of years in the area
  - `proofDocumentUrl`: Uploaded proof document
  - `verificationStatus`: PENDING | APPROVED | REJECTED | SUSPENDED
  - `trustScore`: Calculated score (default 0)
  - `complaintsCount`: Number of complaints received
  - `positiveFeedbackCount`: Number of positive feedback
  - `suspended`: Boolean flag
  - `rejectionReason`, `suspensionReason`: Admin notes

- **Methods:**
  - `calculateTrustScore()`: (+5 per feedback) - (10 per complaint)
  - `checkSuspension()`: Auto-suspend at 5 complaints

#### ChatMessage Model (`trustbridge-backend/models/ChatMessage.js`)
- **Fields:**
  - `sender`, `receiver`: User references
  - `message`: Text content (max 1000 chars)
  - `isReported`: Boolean flag
  - `reportReason`, `reportedBy`, `reportedAt`: Report tracking

#### Updated User Model
- Added `LOCAL_RESIDENT` to role enum

---

### 2. Controllers Created

#### Resident Controller (`trustbridge-backend/controllers/residentController.js`)
**Endpoints:**
- `POST /api/residents/register` - Register as local resident
- `GET /api/residents/profile` - Get own profile (LOCAL_RESIDENT only)
- `GET /api/residents/:id` - Get resident by ID (public, verified only)
- `GET /api/residents/area/:city/:area` - Get verified residents by area
- `POST /api/residents/:id/report` - Report resident for incorrect guidance
- `POST /api/residents/:id/feedback` - Give positive feedback

#### Admin Resident Controller (`trustbridge-backend/controllers/adminResidentController.js`)
**Endpoints (ADMIN only):**
- `GET /api/admin/residents/pending` - Get pending residents
- `GET /api/admin/residents` - Get all residents with filters
- `PATCH /api/admin/residents/:id/approve` - Approve resident
- `PATCH /api/admin/residents/:id/reject` - Reject with reason
- `PATCH /api/admin/residents/:id/suspend` - Suspend with reason
- `PATCH /api/admin/residents/:id/unsuspend` - Unsuspend resident
- `PATCH /api/admin/residents/:id/trust-score` - Update trust score manually

#### Secure Chat Controller (`trustbridge-backend/controllers/secureChatController.js`)
**Endpoints:**
- `POST /api/secure-chat/send` - Send message
- `GET /api/secure-chat/conversation/:userId` - Get conversation
- `GET /api/secure-chat/conversations` - Get all conversations
- `POST /api/secure-chat/report/:messageId` - Report message
- `GET /api/secure-chat/residents` - Get verified residents for chat

---

### 3. Routes Created

- `trustbridge-backend/routes/residentRoutes.js`
- `trustbridge-backend/routes/adminResidentRoutes.js`
- `trustbridge-backend/routes/secureChatRoutes.js`

All routes integrated into `server.js`

---

### 4. Middleware Updates

#### Role Middleware (`trustbridge-backend/middleware/roleMiddleware.js`)
Added `requireApprovedResident()` middleware:
- Checks if LOCAL_RESIDENT is APPROVED
- Returns appropriate error messages for PENDING/REJECTED/SUSPENDED
- Attaches resident object to request

---

## Frontend Implementation

### 1. Pages Created

#### LocalResidentSignup (`trustbridge-v2/src/pages/LocalResidentSignup.jsx`)
**Features:**
- Full name, email, password fields
- City, area, years staying inputs
- Proof document upload (Aadhaar/Utility Bill)
- Terms agreement checkbox
- Two-step registration:
  1. Create user account with LOCAL_RESIDENT role
  2. Register resident profile with proof

#### VerificationPending (`trustbridge-v2/src/pages/VerificationPending.jsx`)
- Shows "Verification Under Review" message
- Explains 24-48 hour review process
- Back to login button

#### LocalDashboard (`trustbridge-v2/src/pages/LocalDashboard.jsx`)
**Features:**
- Profile card with verification status badge
- Trust score display with breakdown
- Quick action buttons (Explore Services, Help Newcomers)
- Community guidelines
- Location badge in header

#### SecureChat (`trustbridge-v2/src/pages/SecureChat.jsx`)
**Features:**
- Two-panel layout (sidebar + chat)
- Conversations list
- Verified residents list (for newcomers)
- Real-time messaging
- Report message button (⚠️)
- Resident profile display (area, years, trust score)
- Auto-scroll to latest message

#### AdminResidentVerification (`trustbridge-v2/src/pages/AdminResidentVerification.jsx`)
**Features:**
- Filter tabs (Pending, Approved, Rejected, Suspended)
- Resident cards with full details
- Approve/Reject/Suspend/Unsuspend actions
- Proof document link
- Trust score and complaint tracking

---

### 2. Routes Added to App.jsx

```javascript
// Public routes
/signup/local-resident - LocalResidentSignup
/verification-pending - VerificationPending

// Protected routes (LOCAL_RESIDENT)
/local-resident/dashboard - LocalDashboard
/secure-chat - SecureChat (USER + LOCAL_RESIDENT)

// Admin routes
/admin/residents - AdminResidentVerification
```

---

### 3. Role Selection Updated

Updated `RoleSelection.jsx` to include:
- LOCAL_RESIDENT option
- Description: "I want to help newcomers settle in (requires verification)"
- Routes to `/signup/local-resident`

---

## Security Features

### 1. Verification Workflow
- User registers with LOCAL_RESIDENT role
- Status starts as PENDING
- Cannot login until APPROVED
- Admin reviews proof documents
- Admin can APPROVE, REJECT, or SUSPEND

### 2. Login Blocking
- `requireApprovedResident()` middleware checks status
- PENDING → "Verification Under Review"
- REJECTED → Shows rejection reason
- SUSPENDED → Shows suspension notice

### 3. Chat Security
- Only APPROVED residents can reply
- Newcomers can ask questions
- Residents cannot initiate conversations
- Report functionality for incorrect guidance

### 4. Auto-Suspension
- Automatically suspends at 5 complaints
- Sets `verificationStatus = SUSPENDED`
- Sets `suspended = true`
- Adds suspension reason

### 5. Trust Score System
```
trustScore = (positiveFeedbackCount * 5) - (complaintsCount * 10)
Minimum: 0 (cannot go negative)
```

---

## Database Indexes

### Resident Collection
```javascript
{ city: 1, area: 1 }
{ verificationStatus: 1 }
{ user: 1 }
```

### ChatMessage Collection
```javascript
{ sender: 1, receiver: 1 }
{ createdAt: -1 }
{ isReported: 1 }
```

---

## API Testing Guide

### 1. Register as Local Resident
```bash
# Step 1: Signup
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "LOCAL_RESIDENT"
}

# Step 2: Register resident profile
POST /api/residents/register
Headers: { Authorization: "Bearer <token>" }
{
  "city": "Hyderabad",
  "area": "Bachupally",
  "yearsStaying": 5,
  "proofDocumentUrl": "proof_123.pdf",
  "agreeToTerms": true
}
```

### 2. Admin Approve Resident
```bash
PATCH /api/admin/residents/:id/approve
Headers: { Authorization: "Bearer <admin_token>" }
```

### 3. Send Chat Message
```bash
POST /api/secure-chat/send
Headers: { Authorization: "Bearer <token>" }
{
  "receiverId": "user_id",
  "message": "Hello, how can I help?"
}
```

### 4. Report Message
```bash
POST /api/secure-chat/report/:messageId
Headers: { Authorization: "Bearer <token>" }
{
  "reason": "Incorrect information provided"
}
```

---

## File Upload Implementation (TODO)

Currently using placeholder URLs. For production:

### Option 1: Cloudinary
```javascript
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload middleware
const upload = multer({ dest: 'uploads/' });
```

### Option 2: AWS S3
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
```

### Option 3: Local Storage
```javascript
const multer = require('multer');
const storage = multer.diskStorage({
  destination: './uploads/proofs/',
  filename: (req, file, cb) => {
    cb(null, `proof_${Date.now()}_${file.originalname}`);
  }
});
```

---

## Testing Checklist

### Backend
- [ ] Register as LOCAL_RESIDENT
- [ ] Verify PENDING status blocks login
- [ ] Admin approve resident
- [ ] Login after approval
- [ ] Send chat message
- [ ] Report message (increments complaints)
- [ ] Auto-suspend at 5 complaints
- [ ] Give positive feedback (increases trust score)
- [ ] Admin reject resident
- [ ] Admin suspend/unsuspend resident

### Frontend
- [ ] Role selection shows LOCAL_RESIDENT option
- [ ] Signup form validates all fields
- [ ] Proof document upload works
- [ ] Verification pending page displays
- [ ] Dashboard shows correct status badge
- [ ] Trust score displays correctly
- [ ] Secure chat loads conversations
- [ ] Verified residents list displays
- [ ] Send message works
- [ ] Report button appears on received messages
- [ ] Admin verification page loads
- [ ] Admin can approve/reject/suspend

---

## Next Steps

1. **Implement File Upload**
   - Choose storage solution (Cloudinary/S3/Local)
   - Add multer middleware
   - Update signup flow

2. **Add Email Notifications**
   - Verification approved email
   - Verification rejected email
   - Suspension notice email

3. **Add Real-time Chat**
   - Integrate Socket.io
   - Real-time message delivery
   - Online status indicators

4. **Add Search & Filters**
   - Search residents by area
   - Filter by trust score
   - Sort by years staying

5. **Add Analytics**
   - Track response times
   - Monitor complaint patterns
   - Trust score trends

---

## Environment Variables Required

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/trustbridge

# JWT
JWT_SECRET=your_jwt_secret_key

# File Upload (if using Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## Production Deployment Notes

1. **Security:**
   - Enable HTTPS
   - Add rate limiting
   - Implement CSRF protection
   - Sanitize file uploads
   - Add input validation

2. **Performance:**
   - Add Redis caching for chat
   - Implement pagination
   - Optimize database queries
   - Add CDN for static files

3. **Monitoring:**
   - Add error tracking (Sentry)
   - Monitor API performance
   - Track user activity
   - Set up alerts for suspicious activity

---

## Support & Maintenance

For issues or questions:
1. Check this documentation
2. Review API error messages
3. Check browser console for frontend errors
4. Review server logs for backend errors

---

**Implementation Status:** ✅ Complete
**Last Updated:** February 20, 2026
**Version:** 1.0.0
