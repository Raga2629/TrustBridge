const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, updateProfile } = require('../controllers/authController');
const { sendOTPHandler, verifyOTPHandler, getPhoneStatus } = require('../controllers/otpController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Rate limiter: max 20 OTP sends per 15 min per IP/phone (relaxed for dev)
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.body.phoneNumber || req.ip,
  message: { message: 'Too many OTP requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter: max 30 verify attempts per IP per 15 min
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many verification attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protect, updateProfile);

// Optional auth middleware — populates req.user if token present, doesn't block if not
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    protect(req, res, next);
  } else {
    next();
  }
};

// OTP routes — work both logged-in and during signup flow
router.post('/send-otp', otpSendLimiter, optionalAuth, sendOTPHandler);
router.post('/verify-otp', otpVerifyLimiter, optionalAuth, verifyOTPHandler);
router.get('/phone-status', protect, getPhoneStatus);

module.exports = router;
