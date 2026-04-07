/**
 * OCR Service for TrustBridge Document Verification
 * Extracts text from uploaded documents using Tesseract.js
 */

const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs').promises;

class OCRService {
  constructor() {
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.pdf', '.tiff'];
  }

  /**
   * Extract text from document image
   */
  async extractText(filePath) {
    try {
      console.log(`🔍 Starting OCR extraction for: ${filePath}`);

      // Verify file exists
      await fs.access(filePath);

      // Perform OCR
      const result = await Tesseract.recognize(
        filePath,
        'eng', // English language
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      const extractedText = result.data.text;
      console.log(`✅ OCR completed. Extracted ${extractedText.length} characters`);

      return {
        success: true,
        text: extractedText,
        confidence: result.data.confidence,
        metadata: {
          words: result.data.words?.length || 0,
          lines: result.data.lines?.length || 0
        }
      };
    } catch (error) {
      console.error('❌ OCR extraction failed:', error.message);
      return {
        success: false,
        text: '',
        error: error.message
      };
    }
  }

  /**
   * Extract structured data from OCR text
   */
  extractFields(ocrText) {
    const fields = {
      name: this.extractName(ocrText),
      aadhaarNumber: this.extractAadhaar(ocrText),
      gstNumber: this.extractGST(ocrText),
      businessName: this.extractBusinessName(ocrText),
      address: this.extractAddress(ocrText),
      phone: this.extractPhone(ocrText),
      registrationNumber: this.extractRegistrationNumber(ocrText)
    };

    return fields;
  }

  /**
   * Extract Aadhaar number (12 digits)
   */
  extractAadhaar(text) {
    // Pattern: 1234 5678 9012 or 123456789012
    const patterns = [
      /\b\d{4}\s\d{4}\s\d{4}\b/g,
      /\b\d{12}\b/g
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0].replace(/\s/g, '');
      }
    }

    return null;
  }

  /**
   * Extract GST number
   */
  extractGST(text) {
    // Pattern: 22AAAAA0000A1Z5
    const gstPattern = /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/g;
    const matches = text.match(gstPattern);
    
    if (matches && matches.length > 0) {
      return matches[0];
    }

    return null;
  }

  /**
   * Extract name (looks for common patterns)
   */
  extractName(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Look for "Name:" or "Proprietor:" patterns
    const namePatterns = [
      /(?:name|proprietor|owner)[\s:]+([A-Za-z\s]+)/i,
      /^([A-Z][a-z]+\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)$/m
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Fallback: look for capitalized names in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (/^[A-Z][a-z]+\s[A-Z][a-z]+/.test(line) && line.length < 50) {
        return line;
      }
    }

    return null;
  }

  /**
   * Extract business name
   */
  extractBusinessName(text) {
    const businessPatterns = [
      /(?:business\s+name|company\s+name|firm\s+name)[\s:]+([A-Za-z\s&]+)/i,
      /^([A-Z][A-Za-z\s&]+(?:Services|Solutions|Enterprises|Company|Pvt|Ltd))$/m
    ];

    for (const pattern of businessPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Extract address
   */
  extractAddress(text) {
    const addressPatterns = [
      /(?:address|location)[\s:]+([A-Za-z0-9\s,.-]+(?:Hyderabad|Bangalore|Mumbai|Delhi|Chennai)[A-Za-z0-9\s,.-]*)/i,
      /([0-9]+[A-Za-z\s,.-]+(?:Road|Street|Avenue|Lane|Nagar|Colony)[A-Za-z0-9\s,.-]+)/i
    ];

    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Extract phone number
   */
  extractPhone(text) {
    const phonePatterns = [
      /(?:\+91|0)?[\s-]?[6-9]\d{9}\b/g,
      /(?:phone|mobile|contact)[\s:]+(\+?91[\s-]?[6-9]\d{9})/i
    ];

    for (const pattern of phonePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0].replace(/[\s-]/g, '');
      }
    }

    return null;
  }

  /**
   * Extract registration/license number
   */
  extractRegistrationNumber(text) {
    // Look for various registration patterns
    const regPatterns = [
      /(?:registration|license|permit)[\s#:]+([A-Z0-9/-]+)/i,
      /\b[A-Z]{2,4}[/-]?\d{4,8}[/-]?[A-Z0-9]{0,6}\b/g
    ];

    for (const pattern of regPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches[matches.length > 1 ? 1 : 0].trim();
      }
    }

    return null;
  }

  /**
   * Validate extracted Aadhaar format
   */
  validateAadhaarFormat(aadhaar) {
    if (!aadhaar) return false;
    const cleaned = aadhaar.replace(/\s/g, '');
    return /^\d{12}$/.test(cleaned);
  }

  /**
   * Validate GST format
   */
  validateGSTFormat(gst) {
    if (!gst) return false;
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gst);
  }
}

module.exports = new OCRService();
