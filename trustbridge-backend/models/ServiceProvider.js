const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Medical', 'Grocery', 'Education', 'HomeServices', 'Shopping', 'Beauty', 'Transport', 'Temples', 'Rentals', 'Repairs', 'BankATMs', 'PG'],
    trim: true
  },
  businessAddress: {
    type: String,
    required: [true, 'Business address is required'],
    trim: true
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
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  // Document uploads
  ownerIdProof: {
    type: String,
    required: [true, 'Owner ID proof (Aadhaar) is required'],
    trim: true
  },
  businessProof: {
    type: String,
    required: [true, 'Business proof (GST/License) is required'],
    trim: true
  },
  businessAddressProof: {
    type: String,
    required: [true, 'Business address proof (Utility bill) is required'],
    trim: true
  },
  // Verification fields
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
    default: 'PENDING'
  },
  proofVerified: {
    type: Boolean,
    default: false
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
  totalServices: {
    type: Number,
    default: 0
  },
  // OCR extracted data
  ocrData: {
    aadhaarExtracted: {
      name: String,
      aadhaarNumber: String,
      address: String
    },
    businessExtracted: {
      businessName: String,
      gstNumber: String,
      registrationNumber: String,
      address: String,
      phone: String
    },
    aadhaarText: String,
    businessText: String,
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
    aadhaarVerification: mongoose.Schema.Types.Mixed,
    businessVerification: mongoose.Schema.Types.Mixed,
    aadhaarValid: Boolean,
    gstValid: Boolean
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

// Indexes
serviceProviderSchema.index({ user: 1 });
serviceProviderSchema.index({ verificationStatus: 1 });
serviceProviderSchema.index({ city: 1, area: 1 });
serviceProviderSchema.index({ ownerIdProof: 1 }); // For duplicate detection
serviceProviderSchema.index({ businessProof: 1 }); // For duplicate detection

// Update timestamp on save
serviceProviderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate trust score
serviceProviderSchema.methods.calculateTrustScore = function() {
  this.trustScore = (this.positiveFeedbackCount * 5) - (this.complaintsCount * 10) + (this.totalServices * 2);
  if (this.trustScore < 0) this.trustScore = 0;
  return this.trustScore;
};

// Check if should be suspended
serviceProviderSchema.methods.checkSuspension = function() {
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
serviceProviderSchema.methods.addVerificationLog = function(action, adminId, reason = '') {
  this.verificationLogs.push({
    action,
    adminId,
    reason,
    timestamp: new Date()
  });
};

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
