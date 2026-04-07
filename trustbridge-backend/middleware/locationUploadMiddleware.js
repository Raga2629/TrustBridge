const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/location-proof');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const userId = req.user?._id || 'unknown';
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${userId}_addressproof_${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.includes(ext)
    ? cb(null, true)
    : cb(new Error('Only JPG, PNG, PDF, and WEBP files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload.single('addressProof');
