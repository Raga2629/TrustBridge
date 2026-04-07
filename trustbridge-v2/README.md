# TrustBridge Frontend

Complete production-ready React frontend for TrustBridge platform.

## Tech Stack

- React 19 (Vite)
- React Router DOM v6
- Axios for API calls
- Context API for authentication
- Modern responsive UI

## Features

✅ Authentication System (Login/Signup)
✅ JWT token management
✅ Role-based dashboards (USER, LOCAL, PROVIDER, ADMIN)
✅ Protected routes
✅ Service browsing and booking
✅ Review system with ratings
✅ Real-time chat interface
✅ Admin dashboard with statistics
✅ Provider service management
✅ Responsive design

## Installation

1. Navigate to frontend directory:
```bash
cd trustbridge-v2
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Backend Connection

The frontend connects to the backend API at `http://localhost:5000/api`

Make sure your backend is running before starting the frontend.

## Project Structure

```
src/
├── api/
│   └── axios.js              # Axios instance with interceptors
├── context/
│   └── AuthContext.jsx       # Authentication context
├── components/
│   └── Navbar.jsx            # Navigation component
├── pages/
│   ├── Home.jsx              # Landing page
│   ├── Login.jsx             # Login page
│   ├── Signup.jsx            # Signup page
│   ├── Services.jsx          # Services listing
│   ├── ServiceDetail.jsx    # Service details & booking
│   ├── UserDashboard.jsx    # User dashboard
│   ├── ProviderDashboard.jsx # Provider dashboard
│   ├── LocalDashboard.jsx   # Local resident dashboard
│   ├── AdminDashboard.jsx   # Admin dashboard
│   ├── AddService.jsx       # Add new service
│   ├── ProviderServices.jsx # Provider's services
│   ├── AddReview.jsx        # Add review
│   ├── Chat.jsx             # Chat interface
│   └── Unauthorized.jsx     # 403 page
├── routes/
│   └── ProtectedRoute.jsx   # Route protection HOC
└── styles/
    ├── Auth.css
    ├── Home.css
    ├── Navbar.css
    ├── Services.css
    ├── ServiceDetail.css
    ├── Dashboard.css
    ├── Form.css
    ├── Chat.css
    └── Admin.css
```

## User Roles & Access

### USER (Newcomer)
- Browse services
- Book services
- View bookings
- Leave reviews
- Chat with local residents

### LOCAL (Local Resident)
- Respond to chat requests
- Help newcomers
- View chat history

### PROVIDER (Service Provider)
- Add/manage services
- View booking requests
- Accept/reject bookings
- Mark bookings as completed

### ADMIN
- View statistics
- Manage users
- Verify users and services
- Approve reviews
- Handle complaints

## Key Features

### Authentication
- JWT token stored in localStorage
- Auto-logout on token expiration
- Role-based redirect after login

### Protected Routes
- Routes protected by authentication
- Role-based access control
- Automatic redirect to login

### Service Management
- Browse by category
- View service details
- Book appointments
- Leave reviews

### Booking System
- Create bookings
- Cancel bookings
- Reschedule bookings
- Track booking status

### Chat System
- Real-time messaging
- Chat with verified locals
- Mark chats as resolved

### Admin Dashboard
- User management
- Service verification
- Complaint handling
- Platform statistics

## Build for Production

```bash
npm run build
```

The build files will be in the `dist` directory.

## Environment Variables

The API base URL is configured in `src/api/axios.js`:
```javascript
baseURL: 'http://localhost:5000/api'
```

For production, update this to your production API URL.

## Testing

1. Start backend: `cd trustbridge-backend && npm start`
2. Start frontend: `cd trustbridge-v2 && npm run dev`
3. Open `http://localhost:5173`
4. Create accounts with different roles
5. Test all features

## Common Issues

### CORS Errors
Make sure backend has CORS enabled for `http://localhost:5173`

### 401 Unauthorized
Check if JWT token is valid and backend is running

### Routes not working
Ensure React Router is properly configured

## Next Steps

- Deploy backend to production
- Update API base URL
- Deploy frontend to Vercel/Netlify
- Add environment variables
- Enable HTTPS

## Support

For issues, check:
1. Backend is running on port 5000
2. MongoDB is connected
3. JWT tokens are valid
4. CORS is enabled
