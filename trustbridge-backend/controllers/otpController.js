const crypto = require('crypto');
const User = require('../models/User');

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 10; // 10s in dev, increase to 60 in production

// ─── In-memory OTP store for unauthenticated flows ───────────────────────────
// Key: normalizedPhone → { otp, expiry, attempts, createdAt }
const otpStore = new Map();

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of otpStore.entries()) {
    if (now > val.expiry) otpStore.delete(key);
  }
}, 10 * 60 * 1000);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const normalizePhone = (phone) => {
  const digits = phone.replace(/\D/g, '');
  if (phone.startsWith('+')) return phone.replace(/\s/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
};

/**
 * Send OTP via Twilio (free trial works) or fallback to console mock.
 * 
 * To use Twilio:
 * 1. Sign up free at https://www.twilio.com/try-twilio
 * 2. Get Account SID, Auth Token, and a free Twilio phone number
 * 3. Add to .env:
 *    TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *    TWILIO_AUTH_TOKEN=your_auth_token
 *    TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
 */
const sendSMS = async (phoneNumber, otp) => {
  const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER;

  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
    console.log(`\n📱 [MOCK OTP] Phone: ${phoneNumber} | OTP: ${otp}\n`);
    return { sent: true, mode: 'mock', otp };
  }

  try {
    const twilio = require('twilio');
    const client = twilio(TWILIO_SID, TWILIO_TOKEN);

    const message = await client.messages.create({
      body: `Your TrustBridge OTP is: ${otp}. Valid for 5 minutes. Do not share this with anyone.`,
      from: TWILIO_FROM,
      to: phoneNumber
    });

    console.log(`✅ OTP sent via Twilio to ${phoneNumber} | SID: ${message.sid}`);
    return { sent: true, mode: 'twilio' };
  } catch (err) {
    console.error('❌ Twilio error:', err.message);
    // Fallback: console mock only
    console.log(`\n📱 [MOCK OTP] Phone: ${phoneNumber} | OTP: ${otp} | Expires in ${OTP_EXPIRY_MINUTES} min\n`);
    return { sent: true, mode: 'mock', otp };
  }
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/send-otp
 * Body: { phoneNumber }
 * Auth: OPTIONAL — works for both logged-in users and unauthenticated flows
 */
const sendOTPHandler = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required' });

    const normalized = normalizePhone(phoneNumber);
    if (!/^\+\d{10,15}$/.test(normalized)) {
      return res.status(400).json({ message: 'Invalid phone number format. Use 10-digit Indian number.' });
    }

    // ── Resend cooldown check (works for both auth and non-auth) ──
    const existing = otpStore.get(normalized);
    if (existing) {
      const elapsed = Date.now() - existing.createdAt;
      const cooldownMs = RESEND_COOLDOWN_SECONDS * 1000;
      if (elapsed < cooldownMs) {
        const waitSec = Math.ceil((cooldownMs - elapsed) / 1000);
        return res.status(429).json({
          message: `Please wait ${waitSec} seconds before requesting a new OTP.`,
          waitSeconds: waitSec
        });
      }
    }

    const otp = generateOTP();
    const expiry = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    // Store in memory (works for everyone)
    otpStore.set(normalized, { otp, expiry, attempts: 0, createdAt: Date.now() });

    // If user is logged in, also persist phone to their User record
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        phoneNumber: normalized,
        otp,
        otpExpiry: new Date(expiry),
        otpAttempts: 0
      });
    }

    const result = await sendSMS(normalized, otp);

    const response = {
      message: 'OTP sent successfully',
      phoneNumber: normalized,
      expiresIn: OTP_EXPIRY_MINUTES * 60
    };

    // In dev/mock mode only, return OTP in response for easy testing
    // When Twilio sends real SMS, do NOT include OTP in response
    if (result.mode === 'mock') {
      response.otp = result.otp;
      response.note = 'SMS delivery requires Twilio. Use this OTP to test.';
    }
    // result.mode === 'twilio' → OTP goes to phone, not shown on screen

    res.status(200).json(response);
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

/**
 * POST /api/auth/verify-otp
 * Body: { phoneNumber, otp }
 * Auth: OPTIONAL
 */
const verifyOTPHandler = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    const normalized = normalizePhone(phoneNumber);
    const record = otpStore.get(normalized);

    if (!record) {
      return res.status(400).json({ message: 'No OTP found for this number. Please request a new one.' });
    }

    // Expired
    if (Date.now() > record.expiry) {
      otpStore.delete(normalized);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Too many attempts
    if (record.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(normalized);
      return res.status(429).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Wrong OTP
    if (record.otp !== otp.toString().trim()) {
      record.attempts += 1;
      otpStore.set(normalized, record);
      const remaining = MAX_ATTEMPTS - record.attempts;
      return res.status(400).json({
        message: `Incorrect OTP. ${remaining} attempt(s) remaining.`,
        attemptsRemaining: remaining
      });
    }

    // ✅ Correct OTP — clear from store
    otpStore.delete(normalized);

    // If user is logged in, mark their phone as verified
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        phoneNumber: normalized,
        isPhoneVerified: true,
        otp: null,
        otpExpiry: null,
        otpAttempts: 0
      });

      // Award trust points
      try {
        const { onPhoneVerified } = require('../utils/trustEngine');
        await onPhoneVerified(req.user._id);
      } catch { /* trust engine optional */ }
    } else {
      // Not logged in — mark any user with this phone as verified
      await User.findOneAndUpdate(
        { phoneNumber: normalized },
        { isPhoneVerified: true, otp: null, otpExpiry: null, otpAttempts: 0 }
      );
    }

    res.status(200).json({
      message: 'Phone number verified successfully ✅',
      phoneNumber: normalized,
      isPhoneVerified: true
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

/**
 * GET /api/auth/phone-status
 * Returns current user's phone verification status
 */
const getPhoneStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('phoneNumber isPhoneVerified');
    res.json({
      phoneNumber: user.phoneNumber || null,
      isPhoneVerified: user.isPhoneVerified || false
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { sendOTPHandler, verifyOTPHandler, getPhoneStatus };
