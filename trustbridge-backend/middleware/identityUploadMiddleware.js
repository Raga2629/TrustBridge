const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/identity');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const userId = req.user ? req.user._id : 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${userId}_${file.fieldname}_${timestamp}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB per file
});

// Expects fields: idImage, selfieImage
const identityUpload = upload.fields([
  { name: 'idImage', maxCount: 1 },
  { name: 'selfieImage', maxCount: 1 }
]);

module.exports = identityUpload;
