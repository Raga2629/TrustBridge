# TrustBridge Backend - Complete Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

## Step 1: MongoDB Atlas Setup (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free tier M0 is sufficient)
4. Click "Connect" on your cluster
5. Add your IP address to whitelist (or use 0.0.0.0/0 for development)
6. Create a database user with username and password
7. Choose "Connect your application"
8. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/trustbridge`)

## Step 2: Install Dependencies

```bash
cd trustbridge-backend
npm install
```

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Edit `.env` file with your values:
```
PORT=5000
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/trustbridge
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

## Step 4: Start the Server

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
```

## Step 5: Test with Postman

### Postman Testing Checklist

#### 1. Authentication Tests

**Register User (USER role)**
```
POST http://localhost:5000/api/auth/register
Body (JSON):
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER",
  "phone": "1234567890",
  "city": "New York"
}
```

**Register Provider**
```
POST http://localhost:5000/api/auth/register
Body (JSON):
{
  "name": "Service Provider",
  "email": "provider@example.com",
  "password": "password123",
  "role": "PROVIDER",
  "phone": "9876543210",
  "city": "New York"
}
```

**Register Local Resident**
```
POST http://localhost:5000/api/auth/register
Body (JSON):
{
  "name": "Local Resident",
  "email": "local@example.com",
  "password": "password123",
  "role": "LOCAL",
  "phone": "5555555555",
  "city": "New York"
}
```

**Register Admin**
```
POST http://localhost:5000/api/auth/register
Body (JSON):
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "ADMIN",
  "phone": "1111111111",
  "city": "New York"
}
```

**Login**
```
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "john@example.com",
  "password": "password123"
}
```
Save the `token` from response!

#### 2. Service Tests (PROVIDER role required)

**Add Service**
```
POST http://localhost:5000/api/services
Headers:
  Authorization: Bearer YOUR_PROVIDER_TOKEN
Body (JSON):
{
  "name": "Home Cleaning Service",
  "category": "home",
  "description": "Professional home cleaning",
  "location": {
    "city": "New York",
    "address": "123 Main St",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  },
  "timings": {
    "open": "09:00",
    "close": "18:00"
  },
  "contactNumber": "9876543210"
}
```

**Get All Services**
```
GET http://localhost:5000/api/services
```

**Get Services by Category**
```
GET http://localhost:5000/api/services/category/home
```

**Get Service by ID**
```
GET http://localhost:5000/api/services/:serviceId
```

**Update Service**
```
PUT http://localhost:5000/api/services/:serviceId
Headers:
  Authorization: Bearer YOUR_PROVIDER_TOKEN
Body (JSON):
{
  "description": "Updated description"
}
```

#### 3. Booking Tests (USER role required)

**Book Service**
```
POST http://localhost:5000/api/bookings
Headers:
  Authorization: Bearer YOUR_USER_TOKEN
Body (JSON):
{
  "serviceId": "SERVICE_ID_HERE",
  "bookingDate": "2026-03-01",
  "bookingTime": "10:00 AM"
}
```

**Get My Bookings**
```
GET http://localhost:5000/api/bookings/my
Headers:
  Authorization: Bearer YOUR_USER_TOKEN
```

**Get Provider Bookings**
```
GET http://localhost:5000/api/bookings/provider
Headers:
  Authorization: Bearer YOUR_PROVIDER_TOKEN
```

**Accept/Reject Booking (PROVIDER)**
```
PUT http://localhost:5000/api/bookings/:bookingId/status
Headers:
  Authorization: Bearer YOUR_PROVIDER_TOKEN
Body (JSON):
{
  "status": "Accepted"
}
```

**Cancel Booking (USER)**
```
PUT http://localhost:5000/api/bookings/:bookingId/cancel
Headers:
  Authorization: Bearer YOUR_USER_TOKEN
```

**Reschedule Booking**
```
PUT http://localhost:5000/api/bookings/:bookingId/reschedule
Headers:
  Authorization: Bearer YOUR_USER_TOKEN
Body (JSON):
{
  "bookingDate": "2026-03-05",
  "bookingTime": "02:00 PM"
}
```

#### 4. Review Tests (USER role required)

**Add Review**
```
POST http://localhost:5000/api/reviews
Headers:
  Authorization: Bearer YOUR_USER_TOKEN
Body (JSON):
{
  "serviceId": "SERVICE_ID_HERE",
  "rating": 5,
  "comment": "Excellent service!"
}
```

**Get Service Reviews**
```
GET http://localhost:5000/api/reviews/service/:serviceId
```

**Approve Review (ADMIN)**
```
PUT http://localhost:5000/api/reviews/:reviewId/approve
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

#### 5. Chat Tests

**Start Chat (USER with LOCAL)**
```
POST http://localhost:5000/api/chat/start
Headers:
  Authorization: Bearer YOUR_USER_TOKEN
Body (JSON):
{
  "localResidentId": "LOCAL_USER_ID_HERE"
}
```

**Send Message**
```
POST http://localhost:5000/api/chat/message
Headers:
  Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "chatId": "CHAT_ID_HERE",
  "text": "Hello, I need help with..."
}
```

**Get User Chats**
```
GET http://localhost:5000/api/chat/user
Headers:
  Authorization: Bearer YOUR_USER_TOKEN
```

**Get Local Resident Chats**
```
GET http://localhost:5000/api/chat/local
Headers:
  Authorization: Bearer YOUR_LOCAL_TOKEN
```

#### 6. Complaint Tests

**Report Service/Local**
```
POST http://localhost:5000/api/complaints
Headers:
  Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "reportedType": "SERVICE",
  "reportedId": "SERVICE_ID_HERE",
  "reason": "Poor service quality"
}
```

**Get My Complaints**
```
GET http://localhost:5000/api/complaints/my
Headers:
  Authorization: Bearer YOUR_TOKEN
```

#### 7. Admin Tests (ADMIN role required)

**Get Admin Stats**
```
GET http://localhost:5000/api/admin/stats
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Get All Users**
```
GET http://localhost:5000/api/admin/users
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Verify User**
```
PUT http://localhost:5000/api/admin/users/:userId/verify
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Get All Complaints**
```
GET http://localhost:5000/api/admin/complaints
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Resolve Complaint**
```
PUT http://localhost:5000/api/admin/complaints/:complaintId/resolve
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Verify Service**
```
PUT http://localhost:5000/api/services/:serviceId/verify
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
```

## Common Issues & Solutions

### Issue: Cannot connect to MongoDB
**Solution**: Check your MONGO_URI in .env file, ensure IP is whitelisted in MongoDB Atlas

### Issue: "Not authorized" error
**Solution**: Make sure you're sending the JWT token in Authorization header as "Bearer YOUR_TOKEN"

### Issue: "Role not authorized"
**Solution**: Ensure you're using the correct user role for the endpoint (e.g., PROVIDER for creating services)

### Issue: Port already in use
**Solution**: Change PORT in .env file or kill the process using port 5000

## Production Deployment Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Set NODE_ENV=production
- [ ] Use strong MongoDB password
- [ ] Enable MongoDB IP whitelist (don't use 0.0.0.0/0)
- [ ] Add rate limiting middleware
- [ ] Add helmet for security headers
- [ ] Enable CORS only for your frontend domain
- [ ] Set up proper logging
- [ ] Add input sanitization
- [ ] Set up monitoring and error tracking

## Next Steps

1. Test all endpoints in Postman
2. Create a Postman collection for easy testing
3. Build the frontend to consume these APIs
4. Add more features as needed
5. Deploy to production (Heroku, AWS, DigitalOcean, etc.)

## Support

If you encounter any issues, check:
1. Server logs in terminal
2. MongoDB connection status
3. JWT token validity
4. User role permissions
