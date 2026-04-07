/**
 * TrustBridge Trust Engine
 * Central module for all trust score calculations.
 * Call the appropriate function after each trust-affecting event.
 *
 * Score range: 0–100
 * Levels:
 *   0–39  → Low    (red)
 *   40–69 → Medium (yellow)
 *   70–100→ High   (green)
 */

const User = require('../models/User');

// ─── Point values ────────────────────────────────────────────────────────────
const POINTS = {
  IDENTITY_VERIFIED:    +20,
  PHONE_VERIFIED:       +10,
  GENUINE_REVIEW:       +10,
  COMPLETED_BOOKING:    +15,
  REPORT_RECEIVED:      -20,
  SPAM_DETECTED:        -30,
  LOCATION_VERIFIED:    +10,
  PROFILE_COMPLETE:     +5
};

// ─── Level thresholds ────────────────────────────────────────────────────────
const getTrustLevel = (score) => {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
};

/**
 * Core update function — clamps score to 0–100, saves to DB.
 * @param {string} userId
 * @param {number} delta  — positive or negative points
 * @param {string} reason — for logging
 * @returns {Promise<{trustScore, trustLevel}>}
 */
const updateTrustScore = async (userId, delta, reason = '') => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    const before = user.trustScore || 0;
    const raw = before + delta;
    const clamped = Math.min(100, Math.max(0, raw));

    user.trustScore = clamped;
    await user.save();

    const level = getTrustLevel(clamped);
    console.log(`🔐 Trust [${user.name}] ${before} → ${clamped} (${delta > 0 ? '+' : ''}${delta}) | ${reason}`);

    return { trustScore: clamped, trustLevel: level };
  } catch (err) {
    console.error('Trust engine error:', err.message);
    return null;
  }
};

// ─── Named event helpers ─────────────────────────────────────────────────────

const onIdentityVerified    = (userId) => updateTrustScore(userId, POINTS.IDENTITY_VERIFIED,   'Identity verified');
const onPhoneVerified       = (userId) => updateTrustScore(userId, POINTS.PHONE_VERIFIED,      'Phone verified');
const onGenuineReview       = (userId) => updateTrustScore(userId, POINTS.GENUINE_REVIEW,      'Genuine review posted');
const onCompletedBooking    = (userId) => updateTrustScore(userId, POINTS.COMPLETED_BOOKING,   'Booking completed');
const onReportReceived      = (userId) => updateTrustScore(userId, POINTS.REPORT_RECEIVED,     'Report received');
const onSpamDetected        = (userId) => updateTrustScore(userId, POINTS.SPAM_DETECTED,       'Spam review detected');
const onLocationVerified    = (userId) => updateTrustScore(userId, POINTS.LOCATION_VERIFIED,   'Location verified');
const onProfileComplete     = (userId) => updateTrustScore(userId, POINTS.PROFILE_COMPLETE,    'Profile completed');

/**
 * Full recalculation from scratch — use for admin recalc or on-demand sync.
 * Queries all relevant collections and recomputes the score.
 */
const recalculateTrustScore = async (userId) => {
  try {
    const User = require('../models/User');
    const Review = require('../models/Review');
    const Booking = require('../models/Booking');
    const ServiceReport = require('../models/ServiceReport');
    const PhoneOTP = require('../models/PhoneOTP');
    const IdentityVerification = require('../models/IdentityVerification');
    const ProviderLocation = require('../models/ProviderLocation');

    let score = 0;

    // Identity verified
    const identity = await IdentityVerification.findOne({ userId, verificationStatus: 'verified' });
    if (identity) score += Math.abs(POINTS.IDENTITY_VERIFIED);

    // Phone verified
    const phone = await PhoneOTP.findOne({ userId, isVerified: true });
    if (phone) score += Math.abs(POINTS.PHONE_VERIFIED);

    // Location verified (providers)
    const location = await ProviderLocation.findOne({ userId, verificationStatus: 'verified' });
    if (location) score += Math.abs(POINTS.LOCATION_VERIFIED);

    // Genuine reviews posted
    const genuineReviews = await Review.countDocuments({
      user: userId,
      reviewStatus: 'GENUINE',
      isApproved: true
    });
    score += genuineReviews * Math.abs(POINTS.GENUINE_REVIEW);

    // Completed bookings
    const completedBookings = await Booking.countDocuments({ user: userId, status: 'Completed' });
    score += completedBookings * Math.abs(POINTS.COMPLETED_BOOKING);

    // Reports received (deductions)
    const reports = await ServiceReport.countDocuments({ userId });
    score -= reports * Math.abs(POINTS.REPORT_RECEIVED);

    // Spam reviews (deductions)
    const spamReviews = await Review.countDocuments({ user: userId, reviewStatus: 'FAKE' });
    score -= spamReviews * Math.abs(POINTS.SPAM_DETECTED);

    const clamped = Math.min(100, Math.max(0, score));
    await User.findByIdAndUpdate(userId, { trustScore: clamped });

    return { trustScore: clamped, trustLevel: getTrustLevel(clamped) };
  } catch (err) {
    console.error('Recalculate trust error:', err.message);
    return null;
  }
};

module.exports = {
  updateTrustScore,
  getTrustLevel,
  recalculateTrustScore,
  onIdentityVerified,
  onPhoneVerified,
  onGenuineReview,
  onCompletedBooking,
  onReportReceived,
  onSpamDetected,
  onLocationVerified,
  onProfileComplete,
  POINTS
};
