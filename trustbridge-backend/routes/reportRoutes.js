const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  submitReport,
  checkUserReport,
  getAllReports,
  getReportsByService,
  reviewReport,
  bulkServiceAction
} = require('../controllers/serviceReportController');

const router = express.Router();

// Rate limit: max 10 reports per user per hour
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { message: 'Too many reports submitted. Please try again later.' }
});

// User routes
router.post('/', protect, reportLimiter, submitReport);
router.get('/service/:serviceId/check', protect, checkUserReport);

// Admin routes
router.get('/admin/all', protect, authorize('ADMIN'), getAllReports);
router.get('/admin/service/:serviceId', protect, authorize('ADMIN'), getReportsByService);
router.put('/admin/:id', protect, authorize('ADMIN'), reviewReport);
router.put('/admin/service/:serviceId/action', protect, authorize('ADMIN'), bulkServiceAction);

module.exports = router;
