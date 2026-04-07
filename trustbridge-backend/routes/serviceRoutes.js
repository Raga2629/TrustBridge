const express = require('express');
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesByCategory,
  verifyService,
  rejectService,
  getMyServices,
  getPendingServices,
  bulkInsertServices
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const serviceUpload = require('../middleware/serviceUploadMiddleware');

const router = express.Router();

// Admin routes (must be before /:id)
router.post('/bulk', protect, authorize('ADMIN'), bulkInsertServices);
router.get('/admin/pending', protect, authorize('ADMIN'), getPendingServices);

// Provider's own services (includes pending)
router.get('/my-services', protect, authorize('PROVIDER', 'ADMIN'), getMyServices);

// Public routes
router.get('/', getAllServices);
router.get('/category/:category', getServicesByCategory);
router.get('/:id', getServiceById);

// Provider routes
router.post('/', protect, authorize('PROVIDER', 'ADMIN'), serviceUpload, createService);
router.put('/:id', protect, authorize('PROVIDER', 'ADMIN'), updateService);

// Admin only
router.delete('/:id', protect, authorize('ADMIN'), deleteService);
router.put('/:id/verify', protect, authorize('ADMIN'), verifyService);
router.put('/:id/reject', protect, authorize('ADMIN'), rejectService);

module.exports = router;
