const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getPendingResidents,
  getAllResidents,
  approveResident,
  rejectResident,
  suspendResident,
  unsuspendResident,
  updateTrustScore
} = require('../controllers/adminResidentController');

// All routes are ADMIN only
router.use(protect);
router.use(authorize('ADMIN'));

// Get all pending residents
router.get('/pending', getPendingResidents);

// Get all residents with filters
router.get('/', getAllResidents);

// Approve resident
router.patch('/:id/approve', approveResident);

// Reject resident
router.patch('/:id/reject', rejectResident);

// Suspend resident
router.patch('/:id/suspend', suspendResident);

// Unsuspend resident
router.patch('/:id/unsuspend', unsuspendResident);

// Update trust score manually
router.patch('/:id/trust-score', updateTrustScore);

module.exports = router;
