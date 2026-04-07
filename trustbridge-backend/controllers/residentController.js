const Resident = require('../models/Resident');
const User = require('../models/User');

// @desc    Register as local resident
// @route   POST /api/residents/register
// @access  Private
const registerResident = async (req, res) => {
  try {
    console.log('=== RESIDENT REGISTRATION DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    console.log('User from token:', req.user);

    const { city, area, yearsStaying, agreeToTerms } = req.body;

    // Validation - Check all required fields
    if (!city || !area || !yearsStaying) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ 
        message: 'Please provide all required fields: city, area, yearsStaying' 
      });
    }

    // Check file upload
    if (!req.file) {
      console.log('❌ Validation failed: No file uploaded');
      return res.status(400).json({ 
        message: 'Please upload proof document (Aadhaar/Utility Bill)' 
      });
    }

    // Check terms agreement
    if (agreeToTerms !== 'true' && agreeToTerms !== true) {
      console.log('❌ Validation failed: Terms not agreed');
      return res.status(400).json({ message: 'You must agree to terms and conditions' });
    }

    // Convert and validate yearsStaying
    const yearsStayingNum = Number(yearsStaying);
    if (isNaN(yearsStayingNum) || yearsStayingNum <= 0) {
      console.log('❌ Validation failed: Invalid years staying');
      return res.status(400).json({ message: 'Years staying must be a number greater than 0' });
    }

    // Check if user already registered as resident
    const existingResident = await Resident.findOne({ user: req.user._id });
    if (existingResident) {
      console.log('❌ User already registered as resident');
      return res.status(400).json({ message: 'You are already registered as a local resident' });
    }

    console.log('✅ All validations passed, creating resident profile...');

    // Update user role
    await User.findByIdAndUpdate(req.user._id, { role: 'LOCAL_RESIDENT' });
    console.log('✅ User role updated to LOCAL_RESIDENT');

    // Create resident profile with uploaded file path
    const resident = await Resident.create({
      user: req.user._id,
      city: city.trim(),
      area: area.trim(),
      yearsStaying: yearsStayingNum,
      proofDocumentUrl: req.file.path,
      verificationStatus: 'PENDING',
      proofVerified: false,
      trustScore: 0,
      complaintsCount: 0,
      positiveFeedbackCount: 0,
      suspended: false
    });

    console.log('✅ Resident profile created:', resident._id);

    const populatedResident = await Resident.findById(resident._id).populate('user', 'name email');

    console.log('✅ Registration complete!');

    res.status(201).json({
      message: 'Registration successful. Your profile is under review.',
      resident: populatedResident
    });
  } catch (error) {
    console.error('❌ REGISTRATION ERROR:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Send more specific error message
    let errorMessage = 'Registration failed. Please try again.';
    let statusCode = 500;
    
    if (error.code === 11000) {
      errorMessage = 'You have already registered as a local resident.';
      statusCode = 400;
    } else if (error.name === 'ValidationError') {
      errorMessage = 'Please fill all required fields correctly.';
      statusCode = 400;
      // Get specific validation errors
      const validationErrors = Object.values(error.errors).map(err => err.message);
      if (validationErrors.length > 0) {
        errorMessage = validationErrors.join(', ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({ 
      message: errorMessage, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get resident profile
// @route   GET /api/residents/profile
// @access  Private (LOCAL_RESIDENT)
const getResidentProfile = async (req, res) => {
  try {
    const resident = await Resident.findOne({ user: req.user._id }).populate('user', 'name email phone');

    if (!resident) {
      return res.status(404).json({ message: 'Resident profile not found' });
    }

    res.json(resident);
  } catch (error) {
    console.error('Get resident profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get resident by ID (public info)
// @route   GET /api/residents/:id
// @access  Public
const getResidentById = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id)
      .populate('user', 'name')
      .select('city area yearsStaying trustScore verificationStatus');

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    if (resident.verificationStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Resident profile not verified' });
    }

    res.json(resident);
  } catch (error) {
    console.error('Get resident error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get verified residents by area
// @route   GET /api/residents/area/:city/:area
// @access  Public
const getResidentsByArea = async (req, res) => {
  try {
    const { city, area } = req.params;

    const residents = await Resident.find({
      city: new RegExp(city, 'i'),
      area: new RegExp(area, 'i'),
      verificationStatus: 'APPROVED',
      suspended: false
    })
      .populate('user', 'name')
      .select('city area yearsStaying trustScore')
      .sort('-trustScore');

    res.json(residents);
  } catch (error) {
    console.error('Get residents by area error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Report resident for incorrect guidance
// @route   POST /api/residents/:id/report
// @access  Private
const reportResident = async (req, res) => {
  try {
    const { reason } = req.body;

    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    // Increment complaints count
    resident.complaintsCount += 1;
    
    // Recalculate trust score
    resident.calculateTrustScore();
    
    // Check if should be suspended
    const wasSuspended = resident.checkSuspension();
    
    await resident.save();

    res.json({
      message: wasSuspended ? 'Resident has been suspended due to multiple complaints' : 'Report submitted successfully',
      complaintsCount: resident.complaintsCount,
      trustScore: resident.trustScore,
      suspended: resident.suspended
    });
  } catch (error) {
    console.error('Report resident error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Give positive feedback to resident
// @route   POST /api/residents/:id/feedback
// @access  Private
const giveFeedback = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    // Increment positive feedback
    resident.positiveFeedbackCount += 1;
    
    // Recalculate trust score
    resident.calculateTrustScore();
    
    await resident.save();

    res.json({
      message: 'Feedback submitted successfully',
      trustScore: resident.trustScore
    });
  } catch (error) {
    console.error('Give feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerResident,
  getResidentProfile,
  getResidentById,
  getResidentsByArea,
  reportResident,
  giveFeedback
};
