const mongoose = require('mongoose');

const providerLocationSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Address fields
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    default: 'Telangana',
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  // GPS coordinates (GeoJSON Point for future geo queries)
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  // Human-readable lat/lng for easy access
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  // Optional address proof document
  addressProof: {
    type: String, // file path
    default: null
  },
  // Verification
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
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
  },
  // GPS vs address validation result (optional)
  gpsValidation: {
    distanceMeters: { type: Number, default: null },
    isWithinRange: { type: Boolean, default: null },
    validatedAt: { type: Date, default: null }
  }
}, { timestamps: true });

// 2dsphere index for geo queries
providerLocationSchema.index({ coordinates: '2dsphere' });
providerLocationSchema.index({ userId: 1 });
providerLocationSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('ProviderLocation', providerLocationSchema);
