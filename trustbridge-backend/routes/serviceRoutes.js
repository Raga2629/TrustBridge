const express = require('express');
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesByCategory,
  verifyService,
  bulkInsertServices
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const serviceUpload = require('../middleware/serviceUploadMiddleware');

const router = express.Router();

// Bulk insert route (must be before /:id route)
router.post('/bulk', protect, authorize('ADMIN'), bulkInsertServices);

// Main routes - createService now uses file upload middleware
router.post('/', protect, authorize('PROVIDER', 'ADMIN'), serviceUpload, createService);
router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.put('/:id', protect, authorize('PROVIDER', 'ADMIN'), updateService);
router.delete('/:id', protect, authorize('ADMIN'), deleteService);

// Additional routes
router.get('/category/:category', getServicesByCategory);
router.put('/:id/verify', protect, authorize('ADMIN'), verifyService);

module.exports = router;
