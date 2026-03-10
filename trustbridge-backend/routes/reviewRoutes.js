const express = require('express');
const { addReview, getServiceReviews, approveReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, authorize('USER'), addReview);
router.get('/service/:serviceId', getServiceReviews);
router.put('/:id/approve', protect, authorize('ADMIN'), approveReview);

module.exports = router;
