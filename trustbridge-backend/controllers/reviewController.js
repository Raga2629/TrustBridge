const Review = require('../models/Review');
const Service = require('../models/Service');
const { updateTrustScoreOnReview } = require('../utils/trustScore');
const ReviewSpamDetector = require('../utils/reviewSpamDetector');

// Spam detection keywords (legacy - now using AI)
const SPAM_KEYWORDS = ['spam', 'fake', 'scam', 'click here', 'buy now', 'limited offer'];

/**
 * AI Spam Detection Logic
 * Uses advanced AI to detect fake, spam, and manipulative reviews
 */
const detectSpamWithAI = async (userId, serviceId, comment, rating) => {
  try {
    // Basic checks first (duplicate review from same user)
    const existingReview = await Review.findOne({ user: userId, service: serviceId });
    if (existingReview) {
      console.log('🚫 Spam detected: User already reviewed this service');
      return { 
        isSpam: true, 
        reason: 'You have already reviewed this service',
        classification: 'Duplicate'
      };
    }

    // Get user information for AI analysis
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return { isSpam: false };
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

    // Get similar reviews for the same service
    const similarReviews = await Review.find({
      service: serviceId
    }).limit(10);

    const similarReviewTexts = similarReviews.map(r => r.comment);

    // Prepare data for AI analysis
    const reviewData = {
      reviewText: comment,
      rating: rating,
      accountAgeDays,
      totalReviews,
      reviewsToday,
      similarReviews: similarReviewTexts
    };

    // Run AI spam detection
    const detector = new ReviewSpamDetector();
    const analysis = detector.analyzeReview(reviewData);

    console.log('🤖 AI Analysis Result:', {
      classification: analysis.classification,
      confidence: analysis.confidence_score,
      riskLevel: analysis.risk_level
    });

    // Decision logic based on AI classification
    if (analysis.classification === 'Fake') {
      console.log('🚫 AI detected FAKE review - BLOCKING');
      return {
        isSpam: true,
        reason: `Your review appears to be spam or fake. ${analysis.detailed_reasoning}`,
        classification: 'Fake',
        analysis
      };
    }

    if (analysis.classification === 'Suspicious') {
      console.log('⚠️ AI detected SUSPICIOUS review - Flagging for manual review');
      return {
        isSpam: false,
        needsReview: true,
        reason: 'Your review has been flagged for manual review',
        classification: 'Suspicious',
        analysis
      };
    }

    // Genuine review - allow posting
    console.log('✅ AI verified review as GENUINE');
    return {
      isSpam: false,
      classification: 'Genuine',
      analysis
    };

  } catch (error) {
    console.error('Error in AI spam detection:', error);
    // If AI fails, fall back to allowing the review
    return { isSpam: false };
  }
};

// @desc    Add review
// @route   POST /api/reviews
// @access  Private (USER only)
const addReview = async (req, res) => {
  try {
    const { serviceId, rating, comment } = req.body;

    console.log('📝 Review submission:', { userId: req.user._id, serviceId, rating, commentLength: comment?.length });

    // Validation
    if (!serviceId || !rating || !comment) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // AI-powered spam detection
    const spamCheck = await detectSpamWithAI(req.user._id, serviceId, comment, rating);

    if (spamCheck.isSpam) {
      console.log('🚫 Review BLOCKED by AI:', spamCheck.reason);
      return res.status(400).json({ 
        message: spamCheck.reason,
        classification: spamCheck.classification,
        blocked: true
      });
    }

    // Check if review needs manual approval (suspicious)
    const needsApproval = spamCheck.needsReview || false;

    console.log('✅ Review passed AI checks, creating...');

    const review = await Review.create({
      user: req.user._id,
      service: serviceId,
      rating,
      comment,
      isSpamDetected: false,
      isApproved: !needsApproval, // Auto-approve genuine, hold suspicious for review
      aiAnalysis: spamCheck.analysis ? {
        classification: spamCheck.analysis.classification,
        confidenceScore: spamCheck.analysis.confidence_score,
        riskLevel: spamCheck.analysis.risk_level,
        trustScoreAdjustment: spamCheck.analysis.trust_score_adjustment
      } : null
    });

    // CRITICAL FIX: Update service rating AND reviewCount immediately (only for approved reviews)
    const allReviews = await Review.find({ 
      service: serviceId,
      isSpamDetected: false,
      isApproved: true
    });

    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / allReviews.length;

      // Update rating, averageRating, totalReviews AND reviewCount
      await Service.findByIdAndUpdate(serviceId, {
        rating: avgRating,
        averageRating: avgRating,
        totalReviews: allReviews.length,
        reviewCount: allReviews.length  // FIX: Update reviewCount field
      });

      console.log(`✅ Updated service ${serviceId}: rating=${avgRating.toFixed(2)}, reviews=${allReviews.length}`);
    }

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('service', 'name category');

    // Get updated service data to return to frontend
    const updatedService = await Service.findById(serviceId);

    console.log('✅ Review created successfully:', review._id);

    // Return appropriate message based on approval status
    if (needsApproval) {
      res.status(201).json({
        ...populatedReview.toObject(),
        message: 'Your review has been submitted and is pending approval',
        needsApproval: true,
        updatedService: {
          reviewCount: updatedService.reviewCount,
          totalReviews: updatedService.totalReviews,
          rating: updatedService.rating
        }
      });
    } else {
      res.status(201).json({
        ...populatedReview.toObject(),
        updatedService: {
          reviewCount: updatedService.reviewCount,
          totalReviews: updatedService.totalReviews,
          rating: updatedService.rating
        }
      });
    }
  } catch (error) {
    console.error('❌ Add review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
const getServiceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      service: req.params.serviceId,
      isSpamDetected: false 
    })
      .populate('user', 'name')
      .sort('-createdAt');

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addReview, getServiceReviews };

// @desc    Approve review (updates service rating)
// @route   PUT /api/reviews/:id/approve
// @access  Private (ADMIN only)
const approveReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.isSpamDetected) {
      return res.status(400).json({ message: 'Cannot approve spam review' });
    }

    review.isApproved = true;
    await review.save();

    // Update service rating with approved reviews only
    const service = await Service.findById(review.service);
    const approvedReviews = await Review.find({ 
      service: review.service, 
      isApproved: true,
      isSpamDetected: false 
    });

    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / approvedReviews.length;

      service.averageRating = avgRating;
      service.totalReviews = approvedReviews.length;
      await service.save();

      // Update trust score
      await updateTrustScoreOnReview(review.service);
    }

    res.json({ message: 'Review approved successfully', review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addReview, getServiceReviews, approveReview };
