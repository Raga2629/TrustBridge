const express = require('express');
const router = express.Router();
const reviewAnalysisController = require('../controllers/reviewAnalysisController');
const { protect } = require('../middleware/authMiddleware');

// Analyze a single review (before posting)
router.post('/analyze', protect, reviewAnalysisController.analyzeReview);

// Batch analyze existing reviews (admin only)
router.get('/batch-analyze', protect, reviewAnalysisController.batchAnalyzeReviews);

// Get analysis for a specific review
router.get('/:reviewId', protect, reviewAnalysisController.getReviewAnalysis);

module.exports = router;
