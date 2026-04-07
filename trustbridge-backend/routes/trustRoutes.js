const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getTrustScore, getMyTrustScore, adminRecalculate } = require('../controllers/trustController');

const router = express.Router();

router.get('/me', protect, getMyTrustScore);
router.get('/:userId', protect, getTrustScore);
router.post('/recalculate/:userId', protect, authorize('ADMIN'), adminRecalculate);

module.exports = router;
