const express = require('express');
const router = express.Router();
const documentVerificationController = require('../controllers/documentVerificationController');
const { protect } = require('../middleware/authMiddleware');

// Verify document against form data
router.post('/verify', protect, documentVerificationController.verifyDocument);

// Get verification status for a provider
router.get('/status/:providerId', protect, documentVerificationController.getVerificationStatus);

// Batch verify pending documents (admin only - add admin check later)
router.get('/batch-verify', protect, documentVerificationController.batchVerifyDocuments);

// Manual override verification (admin only - add admin check later)
router.put('/override/:providerId', protect, documentVerificationController.overrideVerification);

module.exports = router;
