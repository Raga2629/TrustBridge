const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  area: {
    type: String,
    required: [true, 'Area is required'],
    trim: true
  },
  exactAddress: {
    type: String,
    required: false, // Made optional - can use area instead
    trim: true
  },
  yearsStaying: {
    type: Number,
    required: [true, 'Years staying is required'],
    min: [0, 'Years staying must be positive']
  },
  // Document uploads
  aadhaarDocument: {
    type: String,
    required: false, // Made optional - can use proofDocumentUrl instead
    trim: true
  },
  residenceProof: {
    type: String,
    required: false, // Made optional - can use proofDocumentUrl instead
    trim: true
  },
  // Legacy field for backward compatibility (now primary field)
  proofDocumentUrl: {
    type: String,
    required: [true, 'Proof document is required'], // Made required
    trim: true
  },
  // Verification fields
  proofVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
    default: 'PENDING'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  suspensionReason: {
    type: String,
    trim: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  // Trust and reputation
  trustScore: {
    type: Number,
    default: 0,
    min: 0
  },
  complaintsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  positiveFeedbackCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // OCR extracted data
  ocrData: {
    extractedFields: {
      name: String,
      aadhaarNumber: String,
      address: String,
      phone: String
    },
    ocrText: String,
    extractedAt: Date
  },
  // Verification score (0-100)
  verificationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Detailed verification results
  verificationDetails: {
    verification: mongoose.Schema.Types.Mixed,
    aadhaarValid: Boolean
  },
  // Verification logs for audit trail
  verificationLogs: [{
    action: {
      type: String,
      enum: ['APPROVED', 'REJECTED', 'SUSPENDED', 'REINSTATED', 'DOCUMENT_UPDATED']
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  suspended: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
residentSchema.index({ city: 1, area: 1 });
residentSchema.index({ verificationStatus: 1 });
residentSchema.index({ user: 1 });
residentSchema.index({ aadhaarDocument: 1 }); // For duplicate Aadhaar detection

// Update timestamp on save
residentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate trust score
residentSchema.methods.calculateTrustScore = function() {
  this.trustScore = (this.positiveFeedbackCount * 5) - (this.complaintsCount * 10);
  if (this.trustScore < 0) this.trustScore = 0;
  return this.trustScore;
};

// Check if should be suspended
residentSchema.methods.checkSuspension = function() {
  const COMPLAINT_THRESHOLD = 5;
  if (this.complaintsCount >= COMPLAINT_THRESHOLD && this.verificationStatus !== 'SUSPENDED') {
    this.verificationStatus = 'SUSPENDED';
    this.suspended = true;
    this.suspensionReason = `Automatically suspended due to ${this.complaintsCount} complaints`;
    return true;
  }
  return false;
};

// Add verification log entry
residentSchema.methods.addVerificationLog = function(action, adminId, reason = '') {
  this.verificationLogs.push({
    action,
    adminId,
    reason,
    timestamp: new Date()
  });
};

module.exports = mongoose.model('Resident', residentSchema);
