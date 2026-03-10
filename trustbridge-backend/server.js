const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files (for uploaded images)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/residents', require('./routes/residentRoutes'));
app.use('/api/admin/residents', require('./routes/adminResidentRoutes'));
app.use('/api/secure-chat', require('./routes/secureChatRoutes'));
app.use('/api/provider', require('./routes/providerRoutes'));
app.use('/api/forum', require('./routes/forumRoutes'));
app.use('/api/review-analysis', require('./routes/reviewAnalysisRoutes'));
app.use('/api/document-verification', require('./routes/documentVerificationRoutes'));
app.use('/api/ocr-verification', require('./routes/ocrVerificationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'TrustBridge API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
