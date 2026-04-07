# Hybrid ML System - Part 2: Backend Integration

## STEP 3: Update Review Model

### File: `trustbridge-backend/models/Review.js` (Update)

Add these fields to the existing schema:

```javascript
const reviewSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // Spam Detection Fields
  isSpamDetected: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  reviewStatus: {
    type: String,
    enum: ['GENUINE', 'SUSPICIOUS', 'FAKE', 'PENDING'],
    default: 'PENDING'
  },
  
  // Rule-based Analysis
  ruleBasedScore: {
    type: Number,
    default: 0
  },
  ruleBasedFlags: [{
    type: String
  }],
  
  // ML Analysis
  mlProbability: {
    type: Number,
    default: null
  },
  mlScore: {
    type: Number,
    default: 0
  },
  mlPrediction: {
    type: String,
    enum: ['genuine', 'fake', 'unknown'],
    default: 'unknown'
  },
  mlConfidence: {
    type: Number,
    default: 0
  },
  
  // Combined Analysis
  finalRiskScore: {
    type: Number,
    default: 0
  },
  
  // AI Analysis (existing)
  aiAnalysis: {
    classification: String,
    confidenceScore: String,
    riskLevel: String,
    trustScoreAdjustment: String
  },
  
  // Admin Actions
  adminReviewed: {
    type: Boolean,
    default: false
  },
  adminAction: {
    type: String,
    enum: ['approved', 'rejected', 'pending'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});
```

---

## STEP 4: Update Review Controller

### File: `trustbridge-backend/controllers/reviewController.js` (Update addReview function)

```javascript
const Review = require('../models/Review');
const Service = require('../models/Service');
const ReviewSpamDetector = require('../utils/reviewSpamDetector');
const MLReviewPredictor = require('../utils/mlReviewPredictor');

// Initialize ML predictor
const mlPredictor = new MLReviewPredictor();

// @desc    Add review with hybrid ML detection
// @route   POST /api/reviews
// @access  Private (USER only)
const addReview = async (req, res) => {
  try {
    const { serviceId, rating, comment } = req.body;

    console.log('📝 Review submission:', { 
      userId: req.user._id, 
      serviceId, 
      rating, 
      commentLength: comment?.length 
    });

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

    // Check for duplicate review
    const existingReview = await Review.findOne({ 
      user: req.user._id, 
      service: serviceId 
    });
    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this service' 
      });
    }

    // ========================================
    // STEP 1: RULE-BASED SPAM DETECTION
    // ========================================
    console.log('🔍 Running rule-based detection...');
    
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    const accountAgeDays = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const userReviews = await Review.find({ user: req.user._id });
    const totalReviews = userReviews.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reviewsToday = userReviews.filter(
      review => review.createdAt >= today
    ).length;
    
    const similarReviews = await Review.find({ service: serviceId })
      .limit(10)
      .select('comment');
    const similarReviewTexts = similarReviews.map(r => r.comment);
    
    const reviewData = {
      reviewText: comment,
      rating: rating,
      accountAgeDays,
      totalReviews,
      reviewsToday,
      similarReviews: similarReviewTexts
    };
    
    const ruleDetector = new ReviewSpamDetector();
    const ruleAnalysis = ruleDetector.analyzeReview(reviewData);
    
    const ruleBasedScore = ruleAnalysis.risk_score || 0;
    const ruleBasedFlags = ruleAnalysis.flags || [];
    
    console.log('✅ Rule-based analysis:', {
      classification: ruleAnalysis.classification,
      score: ruleBasedScore,
      flags: ruleBasedFlags.length
    });

    // ========================================
    // STEP 2: ML PREDICTION
    // ========================================
    console.log('🤖 Running ML prediction...');
    
    const mlResult = await mlPredictor.predict(comment);
    
    const mlProbability = mlResult.fakeProbability || 0.5;
    const mlScore = mlPredictor.mlProbabilityToScore(mlProbability);
    const mlPrediction = mlResult.prediction || 'unknown';
    const mlConfidence = mlResult.confidence || 0;
    
    console.log('✅ ML prediction:', {
      prediction: mlPrediction,
      fakeProbability: mlProbability,
      score: mlScore,
      confidence: mlConfidence
    });

    // ========================================
    // STEP 3: CALCULATE FINAL RISK SCORE
    // ========================================
    const finalRiskScore = ruleBasedScore + mlScore;
    
    console.log('📊 Final risk score:', {
      ruleBasedScore,
      mlScore,
      finalRiskScore
    });

    // ========================================
    // STEP 4: CLASSIFY REVIEW
    // ========================================
    let reviewStatus, isApproved, shouldBlock;
    
    if (finalRiskScore >= 60) {
      reviewStatus = 'FAKE';
      isApproved = false;
      shouldBlock = true;
      console.log('🚫 Review classified as FAKE - BLOCKING');
    } else if (finalRiskScore >= 30) {
      reviewStatus = 'SUSPICIOUS';
      isApproved = false;
      shouldBlock = false;
      console.log('⚠️ Review classified as SUSPICIOUS - FLAGGING FOR REVIEW');
    } else {
      reviewStatus = 'GENUINE';
      isApproved = true;
      shouldBlock = false;
      console.log('✅ Review classified as GENUINE - AUTO-APPROVING');
    }

    // Block fake reviews immediately
    if (shouldBlock) {
      return res.status(400).json({
        message: 'Your review has been flagged as potentially fake or spam and cannot be posted.',
        blocked: true,
        reason: ruleAnalysis.detailed_reasoning,
        riskScore: finalRiskScore
      });
    }

    // ========================================
    // STEP 5: CREATE REVIEW
    // ========================================
    const review = await Review.create({
      user: req.user._id,
      service: serviceId,
      rating,
      comment,
      isSpamDetected: !isApproved,
      isApproved,
      reviewStatus,
      ruleBasedScore,
      ruleBasedFlags,
      mlProbability,
      mlScore,
      mlPrediction,
      mlConfidence,
      finalRiskScore,
      aiAnalysis: {
        classification: ruleAnalysis.classification,
        confidenceScore: ruleAnalysis.confidence_score,
        riskLevel: ruleAnalysis.risk_level,
        trustScoreAdjustment: ruleAnalysis.trust_score_adjustment
      }
    });

    // ========================================
    // STEP 6: UPDATE SERVICE RATING (only for approved reviews)
    // ========================================
    if (isApproved) {
      const allReviews = await Review.find({ 
        service: serviceId,
        isSpamDetected: false,
        isApproved: true
      });

      if (allReviews.length > 0) {
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / allReviews.length;

        await Service.findByIdAndUpdate(serviceId, {
          rating: avgRating,
          averageRating: avgRating,
          totalReviews: allReviews.length,
          reviewCount: allReviews.length
        });

        console.log(`✅ Updated service rating: ${avgRating.toFixed(2)} (${allReviews.length} reviews)`);
      }
    }

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('service', 'name category');

    console.log('✅ Review created successfully:', review._id);

    // Return appropriate message
    if (reviewStatus === 'SUSPICIOUS') {
      res.status(201).json({
        ...populatedReview.toObject(),
        message: 'Your review has been submitted and is pending admin approval due to suspicious patterns.',
        needsApproval: true,
        riskScore: finalRiskScore
      });
    } else {
      res.status(201).json({
        ...populatedReview.toObject(),
        message: 'Review submitted successfully!',
        riskScore: finalRiskScore
      });
    }
  } catch (error) {
    console.error('❌ Add review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addReview, getServiceReviews };
```

---

## STEP 5: Admin Review Controller

### File: `trustbridge-backend/controllers/adminReviewController.js` (New)

```javascript
const Review = require('../models/Review');
const Service = require('../models/Service');

// @desc    Get all suspicious reviews
// @route   GET /api/admin/reviews/suspicious
// @access  Private (ADMIN only)
const getSuspiciousReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      reviewStatus: 'SUSPICIOUS',
      adminReviewed: false
    })
      .populate('user', 'name email')
      .populate('service', 'name category')
      .sort('-createdAt');

    res.json({
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Get suspicious reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reviews (with filters)
// @route   GET /api/admin/reviews
// @access  Private (ADMIN only)
const getAllReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.reviewStatus = status.toUpperCase();
    }

    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('service', 'name category')
      .populate('reviewedBy', 'name')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments(query);

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve review
// @route   PUT /api/admin/reviews/:id/approve
// @access  Private (ADMIN only)
const approveReview = async (req, res) => {
  try {
    const { notes } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isApproved = true;
    review.reviewStatus = 'GENUINE';
    review.adminReviewed = true;
    review.adminAction = 'approved';
    review.adminNotes = notes || '';
    review.reviewedBy = req.user._id;
    review.reviewedAt = new Date();

    await review.save();

    // Update service rating
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
      service.rating = avgRating;
      service.totalReviews = approvedReviews.length;
      service.reviewCount = approvedReviews.length;
      await service.save();
    }

    res.json({ 
      message: 'Review approved successfully', 
      review 
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject review
// @route   PUT /api/admin/reviews/:id/reject
// @access  Private (ADMIN only)
const rejectReview = async (req, res) => {
  try {
    const { notes } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isApproved = false;
    review.reviewStatus = 'FAKE';
    review.isSpamDetected = true;
    review.adminReviewed = true;
    review.adminAction = 'rejected';
    review.adminNotes = notes || '';
    review.reviewedBy = req.user._id;
    review.reviewedAt = new Date();

    await review.save();

    res.json({ 
      message: 'Review rejected successfully', 
      review 
    });
  } catch (error) {
    console.error('Reject review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private (ADMIN only)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.remove();

    // Update service rating
    const approvedReviews = await Review.find({ 
      service: review.service, 
      isApproved: true,
      isSpamDetected: false 
    });

    const service = await Service.findById(review.service);
    
    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / approvedReviews.length;

      service.averageRating = avgRating;
      service.rating = avgRating;
      service.totalReviews = approvedReviews.length;
      service.reviewCount = approvedReviews.length;
    } else {
      service.averageRating = 0;
      service.rating = 0;
      service.totalReviews = 0;
      service.reviewCount = 0;
    }
    
    await service.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get review statistics
// @route   GET /api/admin/reviews/stats
// @access  Private (ADMIN only)
const getReviewStats = async (req, res) => {
  try {
    const stats = {
      total: await Review.countDocuments(),
      genuine: await Review.countDocuments({ reviewStatus: 'GENUINE' }),
      suspicious: await Review.countDocuments({ reviewStatus: 'SUSPICIOUS' }),
      fake: await Review.countDocuments({ reviewStatus: 'FAKE' }),
      pending: await Review.countDocuments({ adminReviewed: false, reviewStatus: 'SUSPICIOUS' }),
      approved: await Review.countDocuments({ isApproved: true }),
      rejected: await Review.countDocuments({ isSpamDetected: true })
    };

    res.json(stats);
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSuspiciousReviews,
  getAllReviews,
  approveReview,
  rejectReview,
  deleteReview,
  getReviewStats
};
```

---

*Continued in Part 3 with routes, frontend, and setup guide...*
