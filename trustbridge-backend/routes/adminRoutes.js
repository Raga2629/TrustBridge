const express = require('express');
const {
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
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/stats', protect, authorize('ADMIN'), getAdminStats);
router.get('/complaints', protect, authorize('ADMIN'), getAllComplaints);
router.put('/complaints/:id/resolve', protect, authorize('ADMIN'), resolveComplaint);
router.put('/users/:id/verify', protect, authorize('ADMIN'), verifyUser);
router.put('/verify-user/:id', protect, authorize('ADMIN'), verifyUser);
router.put('/verify-service/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const Service = require('../models/Service');
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    service.isVerified = true;
    await service.save();
    res.json({ message: 'Service verified successfully', service });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.get('/users', protect, authorize('ADMIN'), getAllUsers);
router.get('/users/:id', protect, authorize('ADMIN'), getUserById);
router.get('/providers', protect, authorize('ADMIN'), getAllProviders);
router.put('/providers/:id/verify', protect, authorize('ADMIN'), verifyProvider);

// Review management routes
router.get('/reviews/flagged', protect, authorize('ADMIN'), getFlaggedReviews);
router.put('/reviews/:id/approve', protect, authorize('ADMIN'), approveReview);
router.put('/reviews/:id/remove-spam-flag', protect, authorize('ADMIN'), removeSpamFlag);
router.delete('/reviews/:id', protect, authorize('ADMIN'), deleteReview);

// All services for admin (pending + approved + rejected)
router.get('/all-services', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const Service = require('../models/Service');
    const services = await Service.find({})
      .populate('provider', 'name email phoneNumber isPhoneVerified')
      .sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
