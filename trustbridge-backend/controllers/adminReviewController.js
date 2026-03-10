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

    await review.deleteOne();

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
