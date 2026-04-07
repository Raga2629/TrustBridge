const mongoose = require('mongoose');

const identityVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  idImage: {
    type: String, // file path
    required: true
  },
  selfieImage: {
    type: String, // file path
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  matchScore: {
    type: Number,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('IdentityVerification', identityVerificationSchema);
