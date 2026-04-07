const User = require('../models/User');
const { getTrustLevel, recalculateTrustScore, POINTS } = require('../utils/trustEngine');

/**
 * @desc  Get trust score for any user (public-safe)
 * @route GET /api/trust/:userId
 * @access Private
 */
const getTrustScore = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name trustScore role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const trustLevel = getTrustLevel(user.trustScore);

    res.json({
      userId: user._id,
      name: user.name,
      role: user.role,
      trustScore: user.trustScore,
      trustLevel,
      breakdown: getTrustBreakdown(user.trustScore)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Get own trust score (with full breakdown)
 * @route GET /api/trust/me
 * @access Private
 */
const getMyTrustScore = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name trustScore role');
    const trustLevel = getTrustLevel(user.trustScore);

    res.json({
      trustScore: user.trustScore,
      trustLevel,
      breakdown: getTrustBreakdown(user.trustScore),
      points: POINTS
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Admin: force recalculate trust score for a user
 * @route POST /api/trust/recalculate/:userId
 * @access Private (ADMIN)
 */
const adminRecalculate = async (req, res) => {
  try {
    const result = await recalculateTrustScore(req.params.userId);
    if (!result) return res.status(404).json({ message: 'User not found or recalculation failed' });

    res.json({ message: 'Trust score recalculated', ...result });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper: human-readable breakdown
const getTrustBreakdown = (score) => {
  if (score >= 70) return { label: 'High Trust', description: 'Verified, active, and trusted member', color: '#22c55e' };
  if (score >= 40) return { label: 'Medium Trust', description: 'Partially verified, building reputation', color: '#f59e0b' };
  return { label: 'Low Trust', description: 'New or flagged account — complete verification to improve', color: '#ef4444' };
};

module.exports = { getTrustScore, getMyTrustScore, adminRecalculate };
