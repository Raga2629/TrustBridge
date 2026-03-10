const express = require('express');
const router = express.Router();
const {
  getSuspiciousReviews,
  getAllReviews,
  approveReview,
  rejectReview,
  deleteReview,
  getReviewStats
} = require('../controllers/adminReviewController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(protect);
router.use(adminOnly);

// Get review statistics
router.get('/stats', getReviewStats);

// Get suspicious reviews
router.get('/suspicious', getSuspiciousReviews);

// Get all reviews with filters
router.get('/', getAllReviews);

// Approve review
router.put('/:id/approve', approveReview);

// Reject review
router.put('/:id/reject', rejectReview);

// Delete review
router.delete('/:id', deleteReview);

module.exports = router;
