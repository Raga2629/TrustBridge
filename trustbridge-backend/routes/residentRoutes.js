const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  registerResident,
  getResidentProfile,
  getResidentById,
  getResidentsByArea,
  reportResident,
  giveFeedback
} = require('../controllers/residentController');

// Register as local resident (any authenticated user) - with file upload
router.post('/register', protect, (req, res, next) => {
  upload.single('proofDocument')(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
}, registerResident);

// Get own resident profile (LOCAL_RESIDENT only)
router.get('/profile', protect, authorize('LOCAL_RESIDENT'), getResidentProfile);

// Get resident by ID (public)
router.get('/:id', getResidentById);

// Get verified residents by area (public)
router.get('/area/:city/:area', getResidentsByArea);

// Report resident (authenticated users)
router.post('/:id/report', protect, reportResident);

// Give positive feedback (authenticated users)
router.post('/:id/feedback', protect, giveFeedback);

module.exports = router;
