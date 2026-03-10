const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true
  },
  isSpamDetected: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  reviewStatus: {
    type: String,
    enum: ['GENUINE', 'SUSPICIOUS', 'FAKE', 'PENDING'],
    default: 'PENDING'
  },
  
  // Rule-based Analysis
  ruleBasedScore: {
    type: Number,
    default: 0
  },
  ruleBasedFlags: [{
    type: String
  }],
  
  // ML Analysis
  mlProbability: {
    type: Number,
    default: null
  },
  mlScore: {
    type: Number,
    default: 0
  },
  mlPrediction: {
    type: String,
    enum: ['genuine', 'fake', 'unknown'],
    default: 'unknown'
  },
  mlConfidence: {
    type: Number,
    default: 0
  },
  
  // Combined Analysis
  finalRiskScore: {
    type: Number,
    default: 0
  },
  
  aiAnalysis: {
    classification: {
      type: String,
      enum: ['Genuine', 'Suspicious', 'Fake']
    },
    confidenceScore: String,
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    },
    trustScoreAdjustment: {
      type: String,
      enum: ['Increase', 'No Change', 'Decrease']
    },
    analyzedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Admin Actions
  adminReviewed: {
    type: Boolean,
    default: false
  },
  adminAction: {
    type: String,
    enum: ['approved', 'rejected', 'pending'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index: One review per user per service
reviewSchema.index({ user: 1, service: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
