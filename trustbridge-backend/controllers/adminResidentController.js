const Resident = require('../models/Resident');
const User = require('../models/User');

// @desc    Get all pending residents
// @route   GET /api/admin/residents/pending
// @access  Private (ADMIN only)
const getPendingResidents = async (req, res) => {
  try {
    const residents = await Resident.find({ verificationStatus: 'PENDING' })
      .populate('user', 'name email phone createdAt')
      .sort('-createdAt');

    res.json(residents);
  } catch (error) {
    console.error('Get pending residents error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all residents (with filters)
// @route   GET /api/admin/residents
// @access  Private (ADMIN only)
const getAllResidents = async (req, res) => {
  try {
    const { status, city, area } = req.query;
    
    let query = {};
    
    if (status) {
      query.verificationStatus = status;
    }
    
    if (city) {
      query.city = new RegExp(city, 'i');
    }
    
    if (area) {
      query.area = new RegExp(area, 'i');
    }

    const residents = await Resident.find(query)
      .populate('user', 'name email phone createdAt')
      .sort('-createdAt');

    res.json(residents);
  } catch (error) {
    console.error('Get all residents error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve resident
// @route   PATCH /api/admin/residents/:id/approve
// @access  Private (ADMIN only)
const approveResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    if (resident.verificationStatus === 'APPROVED') {
      return res.status(400).json({ message: 'Resident is already approved' });
    }

    resident.verificationStatus = 'APPROVED';
    resident.proofVerified = true;
    resident.suspended = false;
    resident.rejectionReason = undefined;
    resident.suspensionReason = undefined;
    resident.verifiedBy = req.user._id;
    resident.verifiedAt = new Date();

    // Add verification log
    resident.addVerificationLog('APPROVED', req.user._id);

    await resident.save();

    const populatedResident = await Resident.findById(resident._id)
      .populate('user', 'name email')
      .populate('verifiedBy', 'name email');

    res.json({
      message: 'Resident approved successfully',
      resident: populatedResident
    });
  } catch (error) {
    console.error('Approve resident error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject resident
// @route   PATCH /api/admin/residents/:id/reject
// @access  Private (ADMIN only)
const rejectResident = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const resident = await Resident.findById(req.params.id);

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    resident.verificationStatus = 'REJECTED';
    resident.proofVerified = false;
    resident.rejectionReason = reason;
    resident.verifiedBy = req.user._id;
    resident.verifiedAt = new Date();

    // Add verification log
    resident.addVerificationLog('REJECTED', req.user._id, reason);

    await resident.save();

    const populatedResident = await Resident.findById(resident._id)
      .populate('user', 'name email')
      .populate('verifiedBy', 'name email');

    res.json({
      message: 'Resident rejected',
      resident: populatedResident
    });
  } catch (error) {
    console.error('Reject resident error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Suspend resident
// @route   PATCH /api/admin/residents/:id/suspend
// @access  Private (ADMIN only)
const suspendResident = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Suspension reason is required' });
    }

    const resident = await Resident.findById(req.params.id);

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    resident.verificationStatus = 'SUSPENDED';
    resident.suspended = true;
    resident.suspensionReason = reason;

    // Add verification log
    resident.addVerificationLog('SUSPENDED', req.user._id, reason);

    await resident.save();

    const populatedResident = await Resident.findById(resident._id)
      .populate('user', 'name email')
      .populate('verifiedBy', 'name email');

    res.json({
      message: 'Resident suspended',
      resident: populatedResident
    });
  } catch (error) {
    console.error('Suspend resident error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Unsuspend resident
// @route   PATCH /api/admin/residents/:id/unsuspend
// @access  Private (ADMIN only)
const unsuspendResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    resident.verificationStatus = 'APPROVED';
    resident.suspended = false;
    resident.suspensionReason = undefined;

    // Add verification log
    resident.addVerificationLog('REINSTATED', req.user._id);

    await resident.save();

    const populatedResident = await Resident.findById(resident._id)
      .populate('user', 'name email')
      .populate('verifiedBy', 'name email');

    res.json({
      message: 'Resident unsuspended',
      resident: populatedResident
    });
  } catch (error) {
    console.error('Unsuspend resident error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update resident trust score manually
// @route   PATCH /api/admin/residents/:id/trust-score
// @access  Private (ADMIN only)
const updateTrustScore = async (req, res) => {
  try {
    const { trustScore } = req.body;

    if (trustScore === undefined || trustScore < 0) {
      return res.status(400).json({ message: 'Valid trust score is required' });
    }

    const resident = await Resident.findById(req.params.id);

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    resident.trustScore = trustScore;
    await resident.save();

    res.json({
      message: 'Trust score updated',
      trustScore: resident.trustScore
    });
  } catch (error) {
    console.error('Update trust score error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Check for duplicate Aadhaar documents (fraud prevention)
// @route   POST /api/admin/residents/check-duplicates
// @access  Private (ADMIN only)
const checkDuplicateDocuments = async (req, res) => {
  try {
    const { aadhaarDocument } = req.body;

    const duplicates = {
      aadhaarDocument: []
    };

    if (aadhaarDocument) {
      const dupAadhaar = await Resident.find({ 
        aadhaarDocument,
        _id: { $ne: req.body.excludeId }
      }).populate('user', 'name email');
      duplicates.aadhaarDocument = dupAadhaar;
    }

    const hasDuplicates = duplicates.aadhaarDocument.length > 0;

    res.json({
      hasDuplicates,
      duplicates
    });
  } catch (error) {
    console.error('Check duplicates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPendingResidents,
  getAllResidents,
  approveResident,
  rejectResident,
  suspendResident,
  unsuspendResident,
  updateTrustScore,
  checkDuplicateDocuments
};
