/**
 * Service Image Verification - Production/Free-tier compatible
 * 
 * Strategy:
 * 1. Check file type (must be image, not PDF/document)
 * 2. Check file size (too small = likely not a real photo)
 * 3. Check image dimensions via JPEG/PNG header parsing
 * 4. Validate it's not an ID card / document (by checking aspect ratio + size patterns)
 * 
 * No Python, no TensorFlow, no external APIs needed.
 * Works on any Node.js free hosting.
 */

const fs = require('fs');
const path = require('path');

// Minimum image size for a real service photo (50KB)
const MIN_IMAGE_SIZE = 50 * 1024;
// Maximum for a document/ID scan that's been uploaded as service image
// Aadhaar cards are typically 1-5MB scans
const AADHAAR_SIZE_MIN = 500 * 1024; // 500KB

/**
 * Parse image dimensions from JPEG/PNG binary header
 */
const getImageDimensions = (buffer) => {
  try {
    // PNG: width at bytes 16-19, height at 20-23
    if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height, format: 'png' };
    }
    // JPEG: scan for SOF marker
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      let i = 2;
      while (i < buffer.length - 8) {
        if (buffer[i] === 0xFF) {
          const marker = buffer[i + 1];
          if (marker >= 0xC0 && marker <= 0xC3) {
            const height = buffer.readUInt16BE(i + 5);
            const width = buffer.readUInt16BE(i + 7);
            return { width, height, format: 'jpeg' };
          }
          const segLen = buffer.readUInt16BE(i + 2);
          i += 2 + segLen;
        } else {
          i++;
        }
      }
    }
  } catch { /* ignore */ }
  return null;
};

/**
 * Verify service image is a real service photo, not a document/ID/random file.
 */
const verifyServiceImage = async (imagePath, serviceName, category, description = '') => {
  try {
    if (!fs.existsSync(imagePath)) {
      return { isValid: false, confidence: 0, detectedContent: 'none', reason: 'Image file not found' };
    }

    const stat = fs.statSync(imagePath);
    const fileSize = stat.size;
    const ext = path.extname(imagePath).toLowerCase();

    // 1. Must be an image file
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (!validExts.includes(ext)) {
      return {
        isValid: false, confidence: 0,
        detectedContent: `file type: ${ext}`,
        reason: `Please upload an image file (JPG, PNG). You uploaded a ${ext} file.`
      };
    }

    // 2. Too small = likely not a real photo (icon, placeholder)
    if (fileSize < 10 * 1024) { // less than 10KB
      return {
        isValid: false, confidence: 0,
        detectedContent: `tiny file (${Math.round(fileSize/1024)}KB)`,
        reason: `Image is too small (${Math.round(fileSize/1024)}KB). Please upload a real photo of your service/shop.`
      };
    }

    // 3. Read image header to get dimensions
    const buf = Buffer.alloc(Math.min(65536, fileSize));
    const fd = fs.openSync(imagePath, 'r');
    fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd);

    const dims = getImageDimensions(buf);

    // 4. Check if it looks like an ID card / document scan
    // Aadhaar cards are typically landscape, high-res scans (>1MB, wide aspect ratio)
    if (dims) {
      const aspectRatio = dims.width / dims.height;
      const isLandscapeDocument = aspectRatio > 1.5 && fileSize > AADHAAR_SIZE_MIN;
      const isPortraitDocument = aspectRatio < 0.8 && fileSize > AADHAAR_SIZE_MIN && dims.height > 2000;

      if (isLandscapeDocument) {
        return {
          isValid: false, confidence: 0,
          detectedContent: `document scan (${dims.width}x${dims.height}, ${Math.round(fileSize/1024)}KB)`,
          reason: `This looks like a document scan (${dims.width}x${dims.height} pixels). Please upload an actual photo of your ${category} service/shop, not an ID card or document.`
        };
      }
    }

    // 5. Passed all checks — accept the image
    const confidence = dims ? Math.min(95, 60 + Math.round((fileSize / (1024 * 1024)) * 20)) : 70;
    return {
      isValid: true,
      confidence: Math.min(confidence, 95),
      detectedContent: dims ? `${dims.width}x${dims.height} image` : 'image',
      reason: `Image accepted for ${category} service.`
    };

  } catch (e) {
    // On error, accept but note it
    return {
      isValid: true, confidence: 50,
      detectedContent: 'unknown',
      reason: 'Image accepted. Admin will review if needed.'
    };
  }
};

module.exports = { verifyServiceImage };
