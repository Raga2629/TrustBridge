const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const identityUpload = require('../middleware/identityUploadMiddleware');
const {
  uploadAndVerify,
  getStatus,
  getAllVerifications,
  adminReview
} = require('../controllers/identityVerificationController');

const router = express.Router();

// User routes
router.post('/upload', protect, identityUpload, uploadAndVerify);
router.get('/status', protect, getStatus);

// Admin routes
router.get('/admin/all', protect, authorize('ADMIN'), getAllVerifications);
router.put('/admin/:id', protect, authorize('ADMIN'), adminReview);

module.exports = router;
