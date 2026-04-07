const mongoose = require('mongoose');

const serviceReportSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: ['fake_service', 'scam', 'wrong_info', 'closed_business', 'inappropriate', 'other'],
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
    default: 'pending'
  },
  adminNote: {
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
  },
  ipAddress: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Prevent duplicate reports from same user on same service
serviceReportSchema.index({ serviceId: 1, userId: 1 }, { unique: true });
serviceReportSchema.index({ status: 1 });

module.exports = mongoose.model('ServiceReport', serviceReportSchema);
