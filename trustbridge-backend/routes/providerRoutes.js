const express = require('express');
const {
  getProviderStats,
  getMyServices,
  deleteMyService
} = require('../controllers/providerController');
const {
  submitLocation,
  getMyLocation,
  getAllLocations,
  adminReviewLocation
} = require('../controllers/providerLocationController');
const locationUpload = require('../middleware/locationUploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/stats', protect, authorize('PROVIDER'), getProviderStats);
router.get('/services', protect, authorize('PROVIDER'), getMyServices);
router.delete('/services/:id', protect, authorize('PROVIDER'), deleteMyService);

// Location verification routes
router.post('/location', protect, authorize('PROVIDER'), locationUpload, submitLocation);
router.get('/location', protect, authorize('PROVIDER'), getMyLocation);

// Admin location routes
router.get('/location/admin/all', protect, authorize('ADMIN'), getAllLocations);
router.put('/location/admin/:id', protect, authorize('ADMIN'), adminReviewLocation);

module.exports = router;
