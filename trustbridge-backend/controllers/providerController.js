const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// @desc    Get provider dashboard statistics
// @route   GET /api/provider/stats
// @access  Private (PROVIDER only)
const getProviderStats = async (req, res) => {
  try {
    const providerId = req.user._id;

    // Get all services by this provider
    const services = await Service.find({ provider: providerId });
    const serviceIds = services.map(s => s._id);

    // Total services
    const totalServices = services.length;

    // Get all bookings for provider's services
    const bookings = await Booking.find({ service: { $in: serviceIds } });
    const totalBookings = bookings.length;

    // Bookings by status
    const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
    const acceptedBookings = bookings.filter(b => b.status === 'Accepted').length;
    const completedBookings = bookings.filter(b => b.status === 'Completed').length;
    const rejectedBookings = bookings.filter(b => b.status === 'Rejected').length;

    // Get all reviews for provider's services
    const reviews = await Review.find({ service: { $in: serviceIds } });
    const totalReviews = reviews.length;
    const averageRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // Recent bookings (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentBookings = bookings.filter(b => new Date(b.createdAt) >= sevenDaysAgo).length;

    res.json({
      overview: {
        totalServices,
        totalBookings,
        totalReviews,
        averageRating: parseFloat(averageRating),
        recentBookings
      },
      bookings: {
        pending: pendingBookings,
        accepted: acceptedBookings,
        completed: completedBookings,
        rejected: rejectedBookings
      },
      provider: {
        name: req.user.name,
        email: req.user.email,
        trustScore: req.user.trustScore,
        isVerified: req.user.isVerified
      }
    });
  } catch (error) {
    console.error('Provider stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get provider's own services
// @route   GET /api/provider/services
// @access  Private (PROVIDER only)
const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id })
      .sort('-createdAt');

    // Enhance each service with booking and review counts
    const enhancedServices = await Promise.all(
      services.map(async (service) => {
        const bookingCount = await Booking.countDocuments({ service: service._id });
        const reviewCount = await Review.countDocuments({ service: service._id });
        
        return {
          ...service.toObject(),
          bookingCount,
          reviewCount
        };
      })
    );

    res.json(enhancedServices);
  } catch (error) {
    console.error('Get my services error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete provider's own service
// @route   DELETE /api/provider/services/:id
// @access  Private (PROVIDER only)
const deleteMyService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if provider owns this service
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    // Check if there are active bookings
    const activeBookings = await Booking.countDocuments({
      service: service._id,
      status: { $in: ['Pending', 'Accepted'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete service with active bookings. Please complete or reject them first.' 
      });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProviderStats,
  getMyServices,
  deleteMyService
};
