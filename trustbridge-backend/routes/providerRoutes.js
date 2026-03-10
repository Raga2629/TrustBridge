const express = require('express');
const {
  getProviderStats,
  getMyServices,
  deleteMyService
} = require('../controllers/providerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/stats', protect, authorize('PROVIDER'), getProviderStats);
router.get('/services', protect, authorize('PROVIDER'), getMyServices);
router.delete('/services/:id', protect, authorize('PROVIDER'), deleteMyService);

module.exports = router;
