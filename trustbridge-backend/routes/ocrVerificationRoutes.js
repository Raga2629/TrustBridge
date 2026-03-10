/**
 * OCR Verification Routes
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const ocrVerificationController = require('../controllers/ocrVerificationController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/verification-documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|tiff/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, PDF, TIFF) are allowed'));
    }
  }
});

// Service Provider verification
router.post(
  '/provider/:providerId',
  protect,
  authorize('ADMIN', 'SERVICE_PROVIDER'),
  upload.fields([
    { name: 'aadhaarDocument', maxCount: 1 },
    { name: 'businessProof', maxCount: 1 }
  ]),
  ocrVerificationController.verifyServiceProviderDocuments
);

// Local Resident verification
router.post(
  '/resident/:residentId',
  protect,
  authorize('ADMIN', 'LOCAL'),
  upload.single('document'),
  ocrVerificationController.verifyResidentDocuments
);

// Get verification status
router.get(
  '/status/:type/:id',
  protect,
  ocrVerificationController.getVerificationStatus
);

module.exports = router;
