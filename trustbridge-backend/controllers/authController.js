const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    console.log('=== USER REGISTRATION DEBUG ===');
    console.log('Request body:', req.body);
    
    const { name, email, password, role, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      console.log(`❌ User already exists: ${email}`);
      console.log(`   User ID: ${userExists._id}`);
      console.log(`   User Role: ${userExists.role}`);
      console.log(`   Created: ${userExists.createdAt}`);
      return res.status(400).json({ 
        message: 'User already exists with this email. Please use a different email or login instead.',
        existingEmail: email
      });
    }

    console.log('✅ Email is available, creating user...');

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'USER',
      phone
    });

    console.log('✅ User created successfully:', user._id);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified,
        trustScore: user.trustScore,
        token: generateToken(user._id)
      });
    } else {
      console.log('❌ Failed to create user');
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('❌ REGISTRATION ERROR:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'This email is already registered. Please use a different email or login instead.',
        error: 'Duplicate email'
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Check if LOCAL_RESIDENT and get verification status + location
      let verificationStatus = null;
      let residentCity = null;
      let residentArea = null;
      let residentLocation = null;
      
      if (user.role === 'LOCAL_RESIDENT') {
        const Resident = require('../models/Resident');
        const resident = await Resident.findOne({ user: user._id });
        
        if (resident) {
          verificationStatus = resident.verificationStatus;
          residentCity = resident.city;
          residentArea = resident.area;
          
          // Generate location coordinates for Bachupally, Hyderabad
          // In production, this should be stored in Resident model
          if (residentCity && residentArea) {
            residentLocation = {
              latitude: 17.4975,  // Bachupally coordinates
              longitude: 78.3931
            };
          }
          
          // Block suspended accounts
          if (verificationStatus === 'SUSPENDED') {
            return res.status(403).json({ 
              message: 'Your account has been suspended.',
              verificationStatus: verificationStatus
            });
          }

          // Inform if pending verification
          if (verificationStatus === 'PENDING') {
            return res.status(403).json({ 
              message: 'Your account is under verification. Please wait for admin approval.',
              verificationStatus: verificationStatus
            });
          }
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: residentCity || user.city,
        area: residentArea,
        location: residentLocation || user.location,
        isVerified: user.isVerified,
        trustScore: user.trustScore,
        verificationStatus: verificationStatus,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile (including location)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.city = req.body.city || user.city;
    
    // Update location if provided
    if (req.body.location) {
      user.location = {
        latitude: req.body.location.latitude,
        longitude: req.body.location.longitude
      };
      console.log('📍 Updated user location:', user.location);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      city: updatedUser.city,
      location: updatedUser.location,
      isVerified: updatedUser.isVerified,
      trustScore: updatedUser.trustScore,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, updateProfile };
