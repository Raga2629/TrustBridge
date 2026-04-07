const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Medical', 'Grocery', 'Food', 'Education', 'HomeServices', 'Shopping', 'Beauty', 'Transport', 'Temples', 'Rentals', 'Repairs', 'BankATMs', 'PG', 'Gym/Fitness'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  area: {
    type: String,
    required: [true, 'Area is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  priceRange: {
    type: String,
    trim: true
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    trim: true
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true,
    lowercase: true
  },
  workingHours: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'   // All new services wait for admin approval
  },
  approvalNote: {
    type: String,
    default: null
  },
  imageVerificationNote: {
    type: String,
    default: null
  },
  imageVerificationScore: {
    type: Number,
    default: null
  },
  image: {
    type: String,
    trim: true
  },
  serviceImageUrl: {
    type: String,
    trim: true
  },
  businessProofUrl: {
    type: String,
    trim: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Legacy fields for backward compatibility
  timings: {
    open: String,
    close: String
  },
  contactNumber: String,
  averageRating: Number,
  isVerified: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index for geospatial queries
serviceSchema.index({ location: '2dsphere' });

// Create compound index for duplicate detection
serviceSchema.index({ name: 1, address: 1 }, { unique: true });

// Create text index for search
serviceSchema.index({ name: 'text', description: 'text', city: 'text', area: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
