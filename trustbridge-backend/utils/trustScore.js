const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const Service = require('../models/Service');

// Trust Score Formula Weights
const WEIGHTS = {
  REVIEW_RATING: 0.5,
  VERIFICATION: 0.3,
  COMPLAINT: -0.2
};

/**
 * Calculate Trust Score for a User or Service Provider
 * Formula: (Review Rating × weight) + (Verification Status × weight) + (Complaint Count × negative weight)
 */
const calculateTrustScore = async (userId) => {
  try {
    // Get all services by this provider
    const services = await Service.find({ provider: userId });
    const serviceIds = services.map(s => s._id);

    // Calculate average rating from all reviews
    const reviews = await Review.find({ 
      service: { $in: serviceIds },
      isSpamDetected: false 
    });

    let avgRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      avgRating = totalRating / reviews.length;
    }

    // Get user verification status
    const User = require('../models/User');
    const user = await User.findById(userId);
    const verificationScore = user.isVerified ? 100 : 0;

    // Count unresolved complaints
    const complaintCount = await Complaint.countDocuments({
      reportedId: userId,
      status: 'Pending'
    });

    // Calculate final trust score (0-100 scale)
    const reviewScore = (avgRating / 5) * 100; // Convert 0-5 to 0-100
    const complaintPenalty = complaintCount * 10; // Each complaint reduces score by 10

    let trustScore = 
      (reviewScore * WEIGHTS.REVIEW_RATING) +
      (verificationScore * WEIGHTS.VERIFICATION) +
      (complaintPenalty * WEIGHTS.COMPLAINT);

    // Ensure score is between 0 and 100
    trustScore = Math.max(0, Math.min(100, trustScore));

    // Update user's trust score
    await User.findByIdAndUpdate(userId, { trustScore: Math.round(trustScore) });

    return Math.round(trustScore);
  } catch (error) {
    console.error('Error calculating trust score:', error);
    return 0;
  }
};

/**
 * Recalculate trust score when review is added
 */
const updateTrustScoreOnReview = async (serviceId) => {
  try {
    const service = await Service.findById(serviceId);
    if (service && service.provider) {
      await calculateTrustScore(service.provider);
    }
  } catch (error) {
    console.error('Error updating trust score on review:', error);
  }
};

/**
 * Recalculate trust score when complaint is resolved
 */
const updateTrustScoreOnComplaint = async (userId) => {
  try {
    await calculateTrustScore(userId);
  } catch (error) {
    console.error('Error updating trust score on complaint:', error);
  }
};

module.exports = {
  calculateTrustScore,
  updateTrustScoreOnReview,
  updateTrustScoreOnComplaint
};
