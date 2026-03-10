const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { updateTrustScoreOnComplaint } = require('../utils/trustScore');

// @desc    Get all complaints
// @route   GET /api/admin/complaints
// @access  Private (ADMIN only)
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email')
      .sort('-createdAt');

    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Resolve complaint
// @route   PUT /api/admin/complaints/:id/resolve
// @access  Private (ADMIN only)
const resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = 'Resolved';
    await complaint.save();

    // Update trust score of reported entity
    await updateTrustScoreOnComplaint(complaint.reportedId);

    res.json({ message: 'Complaint resolved successfully', complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify user account
// @route   PUT /api/admin/users/:id/verify
// @access  Private (ADMIN only)
const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    // Recalculate trust score after verification
    const { calculateTrustScore } = require('../utils/trustScore');
    await calculateTrustScore(user._id);

    res.json({ message: 'User verified successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users (ALL ROLES)
// @route   GET /api/admin/users
// @access  Private (ADMIN only)
const getAllUsers = async (req, res) => {
  try {
    // Return all users except ADMIN role
    const users = await User.find({ role: { $ne: 'ADMIN' } })
      .select('-password')
      .sort('-createdAt');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllComplaints,
  resolveComplaint,
  verifyUser,
  getAllUsers
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (ADMIN only)
const getAdminStats = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalComplaints = await Complaint.countDocuments();

    // Get counts by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get verified vs unverified users
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });

    // Get bookings by status
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get complaints by status
    const complaintsByStatus = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get services by category
    const servicesByCategory = await Service.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get verified vs unverified services
    const verifiedServices = await Service.countDocuments({ isVerified: true });
    const unverifiedServices = await Service.countDocuments({ isVerified: false });

    res.json({
      overview: {
        totalUsers,
        totalServices,
        totalBookings,
        totalComplaints
      },
      users: {
        byRole: usersByRole,
        verified: verifiedUsers,
        unverified: unverifiedUsers
      },
      services: {
        byCategory: servicesByCategory,
        verified: verifiedServices,
        unverified: unverifiedServices
      },
      bookings: {
        byStatus: bookingsByStatus
      },
      complaints: {
        byStatus: complaintsByStatus
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllComplaints,
  resolveComplaint,
  verifyUser,
  getAllUsers,
  getAdminStats
};


// @desc    Get all flagged reviews (spam detected or pending approval)
// @route   GET /api/admin/reviews/flagged
// @access  Private (ADMIN only)
const getFlaggedReviews = async (req, res) => {
  try {
    const flaggedReviews = await Review.find({
      $or: [
        { isSpamDetected: true },
        { isApproved: false }
      ]
    })
      .populate('user', 'name email')
      .populate('service', 'name category')
      .sort('-createdAt');

    res.json(flaggedReviews);
  } catch (error) {
    console.error('Get flagged reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve review
// @route   PUT /api/admin/reviews/:id/approve
// @access  Private (ADMIN only)
const approveReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.isSpamDetected) {
      return res.status(400).json({ message: 'Cannot approve spam-detected review. Remove spam flag first.' });
    }

    review.isApproved = true;
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

      service.rating = avgRating;
      service.averageRating = avgRating;
      service.totalReviews = approvedReviews.length;
      await service.save();
    }

    res.json({ message: 'Review approved successfully', review });
  } catch (error) {
    console.error('Approve review error:', error);
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

    const serviceId = review.service;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate service rating
    const approvedReviews = await Review.find({ 
      service: serviceId, 
      isApproved: true,
      isSpamDetected: false 
    });

    const service = await Service.findById(serviceId);
    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / approvedReviews.length;
      service.rating = avgRating;
      service.averageRating = avgRating;
      service.totalReviews = approvedReviews.length;
    } else {
      service.rating = 0;
      service.averageRating = 0;
      service.totalReviews = 0;
    }
    await service.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove spam flag from review
// @route   PUT /api/admin/reviews/:id/remove-spam-flag
// @access  Private (ADMIN only)
const removeSpamFlag = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isSpamDetected = false;
    await review.save();

    res.json({ message: 'Spam flag removed successfully', review });
  } catch (error) {
    console.error('Remove spam flag error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all service providers with verification details
// @route   GET /api/admin/providers
// @access  Private (ADMIN only)
const getAllProviders = async (req, res) => {
  try {
    const ServiceProvider = require('../models/ServiceProvider');
    
    const providers = await ServiceProvider.find()
      .populate('user', 'name email phone')
      .sort('-createdAt');

    res.json(providers);
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllComplaints,
  resolveComplaint,
  verifyUser,
  getAllUsers,
  getAdminStats,
  getFlaggedReviews,
  approveReview,
  deleteReview,
  removeSpamFlag,
  getAllProviders
};


// @desc    Approve or reject provider verification
// @route   PUT /api/admin/providers/:id/verify
// @access  Private (ADMIN only)
const verifyProvider = async (req, res) => {
  try {
    const ServiceProvider = require('../models/ServiceProvider');
    const { action, reason } = req.body; // action: 'APPROVE' or 'REJECT'
    
    const provider = await ServiceProvider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    if (action === 'APPROVE') {
      provider.verificationStatus = 'APPROVED';
      provider.proofVerified = true;
      provider.verifiedAt = new Date();
      await provider.save();
      
      return res.json({ 
        message: 'Provider approved successfully', 
        provider 
      });
    } else if (action === 'REJECT') {
      provider.verificationStatus = 'REJECTED';
      provider.proofVerified = false;
      provider.rejectionReason = reason || 'Documents do not meet verification requirements';
      await provider.save();
      
      return res.json({ 
        message: 'Provider rejected', 
        provider 
      });
    } else {
      return res.status(400).json({ message: 'Invalid action. Use APPROVE or REJECT' });
    }
  } catch (error) {
    console.error('Verify provider error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllComplaints,
  resolveComplaint,
  verifyUser,
  getAllUsers,
  getAdminStats,
  getFlaggedReviews,
  approveReview,
  deleteReview,
  removeSpamFlag,
  getAllProviders,
  verifyProvider
};


// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private (ADMIN only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllComplaints,
  resolveComplaint,
  verifyUser,
  getAllUsers,
  getAdminStats,
  getFlaggedReviews,
  approveReview,
  deleteReview,
  removeSpamFlag,
  getAllProviders,
  verifyProvider,
  getUserById
};
