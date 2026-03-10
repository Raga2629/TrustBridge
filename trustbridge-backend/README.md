# TrustBridge Backend - Trusted Local Assistance Platform

Complete production-ready backend built with Node.js, Express, MongoDB, and JWT authentication.

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt password hashing
- dotenv for environment variables

## Folder Structure

```
trustbridge-backend/
│
├── server.js
├── .env
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   ├── Service.js
│   ├── Booking.js
│   ├── Review.js
│   └── Complaint.js
├── controllers/
│   ├── authController.js
│   ├── serviceController.js
│   ├── bookingController.js
│   ├── reviewController.js
│   ├── adminController.js
│   └── complaintController.js
├── routes/
│   ├── authRoutes.js
│   ├── serviceRoutes.js
│   ├── bookingRoutes.js
│   ├── reviewRoutes.js
│   ├── adminRoutes.js
│   └── complaintRoutes.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
└── utils/
    └── trustScore.js
```

## Quick Start

1. Navigate to the backend directory:
```bash
cd trustbridge-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
copy .env.example .env
```
Edit `.env` and add your MongoDB connection string.

4. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

**For detailed setup instructions, MongoDB Atlas configuration, and Postman testing guide, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Services
- `POST /api/services` - Add service (PROVIDER only)
- `GET /api/services` - Get all services
- `GET /api/services/category/:category` - Get services by category
- `GET /api/services/:id` - Get service by ID
- `PUT /api/services/:id` - Update service (PROVIDER only - own services)
- `PUT /api/services/:id/verify` - Verify service (ADMIN only)
- `DELETE /api/services/:id` - Delete service (ADMIN only)

### Bookings
- `POST /api/bookings` - Book service (USER only)
- `GET /api/bookings/my` - Get my bookings
- `GET /api/bookings/user` - Get user bookings (USER only)
- `GET /api/bookings/provider` - Get provider bookings (PROVIDER only)
- `PUT /api/bookings/:id/status` - Accept/Reject booking (PROVIDER only)
- `PUT /api/bookings/:id/cancel` - Cancel booking (USER only)
- `PUT /api/bookings/:id/reschedule` - Reschedule booking (USER only)
- `DELETE /api/bookings/:id` - Delete booking (USER only)

### Reviews
- `POST /api/reviews` - Add review (USER only)
- `GET /api/reviews/service/:serviceId` - Get service reviews
- `PUT /api/reviews/:id/approve` - Approve review (ADMIN only)

### Complaints
- `POST /api/complaints` - Report service or local
- `GET /api/complaints/my` - Get my complaints
- `PUT /api/complaints/:id` - Update complaint status

### Admin
- `GET /api/admin/stats` - Get dashboard statistics (ADMIN only)
- `GET /api/admin/complaints` - Get all complaints (ADMIN only)
- `PUT /api/admin/complaints/:id/resolve` - Resolve complaint (ADMIN only)
- `PUT /api/admin/users/:id/verify` - Verify user (ADMIN only)
- `PUT /api/admin/verify-user/:id` - Verify user (ADMIN only)
- `PUT /api/admin/verify-service/:id` - Verify service (ADMIN only)
- `GET /api/admin/users` - Get all users (ADMIN only)

### Chat
- `POST /api/chat/start` - Start chat with local resident (USER only)
- `POST /api/chat/message` - Send message in chat
- `GET /api/chat/user` - Get user's chats (USER only)
- `GET /api/chat/local` - Get local resident's chats (LOCAL only)
- `PUT /api/chat/:id/resolve` - Mark chat as resolved

## User Roles

- `USER` - Newcomer
- `LOCAL` - Local resident
- `PROVIDER` - Service provider
- `ADMIN` - Administrator

## Features

✅ JWT Authentication with bcrypt password hashing
✅ Role-based access control (USER, LOCAL, PROVIDER, ADMIN)
✅ Service management with categories
✅ Booking system with status tracking
✅ Review system with AI spam detection
✅ Admin approval workflow for reviews
✅ Local guidance chat module
✅ Complaint management system
✅ Trust score calculation and auto-update
✅ User and service verification
✅ Admin dashboard with statistics
✅ Clean MVC architecture
✅ Comprehensive error handling
✅ Input validation

## Trust Score System

Trust score is automatically calculated based on:
- Review ratings (50% weight)
- Verification status (30% weight)
- Complaint count (-20% weight)

Score updates automatically when:
- New review is approved
- Complaint is resolved
- User verification status changes

## Service Categories

- medical
- home
- education
- rentals
- beauty
- food
- shopping
- transport

## Review Workflow

1. USER submits review
2. AI spam detection checks for suspicious patterns
3. If not spam, review awaits admin approval
4. ADMIN approves review
5. Service rating updates with approved reviews only
6. Trust score recalculates automatically

## Security

- JWT tokens for authentication
- Password hashing with bcrypt
- Role-based middleware protection
- Verification requirements for LOCAL and PROVIDER roles

## Server Status

Server runs on `http://localhost:5000` by default.
