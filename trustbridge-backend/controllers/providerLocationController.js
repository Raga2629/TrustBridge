const ProviderLocation = require('../models/ProviderLocation');
const ServiceProvider = require('../models/ServiceProvider');
const { onLocationVerified } = require('../utils/trustEngine');

// Haversine formula — distance between two GPS points in meters
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * @desc  Provider submits location
 * @route POST /api/provider/location
 * @access Private (PROVIDER)
 */
const submitLocation = async (req, res) => {
  try {
    const { address, city, state, pincode, latitude, longitude } = req.body;

    if (!address || !city || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'address, city, latitude, and longitude are required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ message: 'Invalid GPS coordinates' });
    }

    // Find the provider profile
    const provider = await ServiceProvider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found. Please complete registration first.' });
    }

    const addressProofPath = req.file
      ? req.file.path.replace(/\\/g, '/').split('uploads/')[1]
      : null;

    const locationData = {
      providerId: provider._id,
      userId: req.user._id,
      address,
      city,
      state: state || 'Telangana',
      pincode: pincode || '',
      latitude: lat,
      longitude: lng,
      coordinates: { type: 'Point', coordinates: [lng, lat] },
      addressProof: addressProofPath,
      verificationStatus: 'pending',
      rejectionReason: null,
      reviewedBy: null,
      reviewedAt: null
    };

    const record = await ProviderLocation.findOneAndUpdate(
      { userId: req.user._id },
      locationData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: 'Location submitted for verification',
      location: {
        address: record.address,
        city: record.city,
        latitude: record.latitude,
        longitude: record.longitude,
        verificationStatus: record.verificationStatus,
        addressProof: record.addressProof ? `/uploads/${record.addressProof}` : null
      }
    });
  } catch (error) {
    console.error('Submit location error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Provider gets their location record
 * @route GET /api/provider/location
 * @access Private (PROVIDER)
 */
const getMyLocation = async (req, res) => {
  try {
    const record = await ProviderLocation.findOne({ userId: req.user._id });

    if (!record) {
      return res.status(200).json({ submitted: false, verificationStatus: 'not_submitted' });
    }

    res.status(200).json({
      submitted: true,
      address: record.address,
      city: record.city,
      state: record.state,
      pincode: record.pincode,
      latitude: record.latitude,
      longitude: record.longitude,
      verificationStatus: record.verificationStatus,
      rejectionReason: record.rejectionReason,
      addressProof: record.addressProof ? `/uploads/${record.addressProof}` : null,
      updatedAt: record.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Admin: get all pending location verifications
 * @route GET /api/provider/location/admin/all
 * @access Private (ADMIN)
 */
const getAllLocations = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { verificationStatus: status } : {};

    const records = await ProviderLocation.find(filter)
      .populate('userId', 'name email')
      .populate('providerId', 'businessName category')
      .sort({ createdAt: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Admin: approve or reject a location
 * @route PUT /api/provider/location/admin/:id
 * @access Private (ADMIN)
 */
const adminReviewLocation = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be verified or rejected' });
    }

    const record = await ProviderLocation.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: status,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!record) return res.status(404).json({ message: 'Location record not found' });

    // Award trust points when location is verified
    if (status === 'verified') {
      await onLocationVerified(record.userId);
    }

    res.status(200).json({ message: `Location ${status}`, record });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { submitLocation, getMyLocation, getAllLocations, adminReviewLocation };
