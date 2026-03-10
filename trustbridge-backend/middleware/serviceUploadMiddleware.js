const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const serviceImagesDir = './uploads/service-images';
const businessProofsDir = './uploads/business-proofs';

if (!fs.existsSync(serviceImagesDir)) {
  fs.mkdirSync(serviceImagesDir, { recursive: true });
}

if (!fs.existsSync(businessProofsDir)) {
  fs.mkdirSync(businessProofsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'serviceImage') {
      cb(null, serviceImagesDir);
    } else if (file.fieldname === 'businessProof') {
      cb(null, businessProofsDir);
    } else {
      cb(new Error('Invalid field name'));
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'serviceImage' ? 'service-' : 'proof-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only accept images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, .png, and .pdf files are allowed'));
  }
};

// Configure multer for multiple files
const serviceUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: fileFilter
});

// Export middleware for handling both files
module.exports = serviceUpload.fields([
  { name: 'serviceImage', maxCount: 1 },
  { name: 'businessProof', maxCount: 1 }
]);
