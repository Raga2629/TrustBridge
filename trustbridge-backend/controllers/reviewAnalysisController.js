const ReviewSpamDetector = require('../utils/reviewSpamDetector');
const Review = require('../models/Review');
const User = require('../models/User');

/**
 * Controller for AI-powered review analysis
 */

// Analyze a single review
exports.analyzeReview = async (req, res) => {
  try {
    const {
      reviewText,
      rating,
      propertyId,
      userId
    } = req.body;

    // Validate input
    if (!reviewText || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Review text and rating are required'
      });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate account age
    const accountAgeDays = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get user's review history
    const userReviews = await Review.find({ user: userId });
    const totalReviews = userReviews.length;

    // Count reviews posted today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reviewsToday = userReviews.filter(
      review => review.createdAt >= today
    ).length;

    // Get similar reviews for the same property
    const similarReviews = await Review.find({
      property: propertyId,
      _id: { $ne: req.body.reviewId } // Exclude current review if editing
    }).limit(10);

    const similarReviewTexts = similarReviews.map(r => r.text);

    // Prepare data for analysis
    const reviewData = {
      reviewText,
      rating,
      accountAgeDays,
      totalReviews,
      reviewsToday,
      similarReviews: similarReviewTexts
    };

    // Analyze review
    const detector = new ReviewSpamDetector();
    const analysis = detector.analyzeReview(reviewData);

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Review analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing review',
      error: error.message
    });
  }
};

// Batch analyze existing reviews
exports.batchAnalyzeReviews = async (req, res) => {
  try {
    const { propertyId, limit = 50 } = req.query;

    const query = propertyId ? { property: propertyId } : {};
    const reviews = await Review.find(query)
      .populate('user')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const detector = new ReviewSpamDetector();
    const results = [];

    for (const review of reviews) {
      const accountAgeDays = Math.floor(
        (Date.now() - review.user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      const userReviews = await Review.find({ user: review.user._id });
      const totalReviews = userReviews.length;

      const reviewDate = new Date(review.createdAt);
      reviewDate.setHours(0, 0, 0, 0);
      const reviewsOnThatDay = userReviews.filter(r => {
        const rDate = new Date(r.createdAt);
        rDate.setHours(0, 0, 0, 0);
        return rDate.getTime() === reviewDate.getTime();
      }).length;

      const similarReviews = await Review.find({
        property: review.property,
        _id: { $ne: review._id }
      }).limit(10);

      const reviewData = {
        reviewText: review.text,
        rating: review.rating,
        accountAgeDays,
        totalReviews,
        reviewsToday: reviewsOnThatDay,
        similarReviews: similarReviews.map(r => r.text)
      };

      const analysis = detector.analyzeReview(reviewData);

      results.push({
        reviewId: review._id,
        userId: review.user._id,
        userName: review.user.name,
        reviewText: review.text.substring(0, 100) + '...',
        analysis
      });
    }

    // Summary statistics
    const summary = {
      total: results.length,
      genuine: results.filter(r => r.analysis.classification === 'Genuine').length,
      suspicious: results.filter(r => r.analysis.classification === 'Suspicious').length,
      fake: results.filter(r => r.analysis.classification === 'Fake').length
    };

    res.json({
      success: true,
      summary,
      results
    });

  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing batch analysis',
      error: error.message
    });
  }
};

// Get review analysis by ID
exports.getReviewAnalysis = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId).populate('user');
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const accountAgeDays = Math.floor(
      (Date.now() - review.user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const userReviews = await Review.find({ user: review.user._id });
    const totalReviews = userReviews.length;

    const reviewDate = new Date(review.createdAt);
    reviewDate.setHours(0, 0, 0, 0);
    const reviewsOnThatDay = userReviews.filter(r => {
      const rDate = new Date(r.createdAt);
      rDate.setHours(0, 0, 0, 0);
      return rDate.getTime() === reviewDate.getTime();
    }).length;

    const similarReviews = await Review.find({
      property: review.property,
      _id: { $ne: review._id }
    }).limit(10);

    const reviewData = {
      reviewText: review.text,
      rating: review.rating,
      accountAgeDays,
      totalReviews,
      reviewsToday: reviewsOnThatDay,
      similarReviews: similarReviews.map(r => r.text)
    };

    const detector = new ReviewSpamDetector();
    const analysis = detector.analyzeReview(reviewData);

    res.json({
      success: true,
      review: {
        id: review._id,
        text: review.text,
        rating: review.rating,
        user: {
          id: review.user._id,
          name: review.user.name,
          accountAge: accountAgeDays
        },
        createdAt: review.createdAt
      },
      analysis
    });

  } catch (error) {
    console.error('Get review analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving review analysis',
      error: error.message
    });
  }
};
