// Allow only specific roles to access route
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role ${req.user.role} is not authorized to access this route` 
      });
    }

    next();
  };
};

// Check if user is verified (for LOCAL and PROVIDER)
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if ((req.user.role === 'LOCAL' || req.user.role === 'PROVIDER') && !req.user.isVerified) {
    return res.status(403).json({ 
      message: 'Your account must be verified to access this resource' 
    });
  }

  next();
};

// Check if LOCAL_RESIDENT is approved
const requireApprovedResident = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (req.user.role === 'LOCAL_RESIDENT') {
    const Resident = require('../models/Resident');
    const resident = await Resident.findOne({ user: req.user._id });

    if (!resident) {
      return res.status(403).json({ 
        message: 'Resident profile not found' 
      });
    }

    if (resident.verificationStatus === 'PENDING') {
      return res.status(403).json({ 
        message: 'Verification Under Review',
        status: 'PENDING'
      });
    }

    if (resident.verificationStatus === 'REJECTED') {
      return res.status(403).json({ 
        message: resident.rejectionReason || 'Your application has been rejected',
        status: 'REJECTED'
      });
    }

    if (resident.verificationStatus === 'SUSPENDED') {
      return res.status(403).json({ 
        message: resident.suspensionReason || 'Your account has been suspended',
        status: 'SUSPENDED'
      });
    }

    // Attach resident to request
    req.resident = resident;
  }

  next();
};

module.exports = { authorize, requireVerified, requireApprovedResident };
