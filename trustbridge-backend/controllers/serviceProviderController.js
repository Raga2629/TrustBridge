const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');

// @desc    Get all pending service providers
// @route   GET /api/admin/providers/pending
// @access  Private (ADMIN only)
const getPendingProviders = async (req, res) => {
  try {
    const providers = await ServiceProvider.find({ verificationStatus: 'PENDING' })
      .populate('user', 'name email phone createdAt')
      .sort('-createdAt');

    res.json(providers);
  } catch (error) {
    console.error('Get pending providers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all service providers (with filters)
// @route   GET /api/admin/providers
// @access  Private (ADMIN only)
const getAllProviders = async (req, res) => {
  try {
    const { status, city, area, category } = req.query;
    
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

    if (category) {
      query.category = category;
    }

    const providers = await ServiceProvider.find(query)
      .populate('user', 'name email phone createdAt')
      .populate('verifiedBy', 'name email')
      .sort('-createdAt');

    res.json(providers);
  } catch (error) {
    console.error('Get all providers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single service provider details
// @route   GET /api/admin/providers/:id
// @access  Private (ADMIN only)
const getProviderDetails = async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id)
      .populate('user', 'name email phone createdAt')
      .populate('verifiedBy', 'name email')
      .populate('verificationLogs.adminId', 'name email');

    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    res.json(provider);
  } catch (error) {
    console.error('Get provider details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve service provider
// @route   PATCH /api/admin/providers/:id/approve
// @access  Private (ADMIN only)
const approveProvider = async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    if (provider.verificationStatus === 'APPROVED') {
      return res.status(400).json({ message: 'Provider is already approved' });
    }

    provider.verificationStatus = 'APPROVED';
    provider.proofVerified = true;
    provider.suspended = false;
    provider.rejectionReason = undefined;
    provider.suspensionReason = undefined;
    provider.verifiedBy = req.user._id;
    provider.verifiedAt = new Date();

    // Add verification log
    provider.addVerificationLog('APPROVED', req.user._id);

    await provider.save();

    // Update user role to PROVIDER
    await User.findByIdAndUpdate(provider.user, { role: 'PROVIDER' });

    const populatedProvider = await ServiceProvider.findById(provider._id)
      .populate('user', 'name email')
      .populate('verifiedBy', 'name email');

    res.json({
      message: 'Service provider approved successfully',
      provider: populatedProvider
    });
  } catch (error) {
    console.error('Approve provider error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject service provider
// @route   PATCH /api/admin/providers/:id/reject
// @access  Private (ADMIN only)
const rejectProvider = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const provider = await ServiceProvider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    provider.verificationStatus = 'REJECTED';
    provider.proofVerified = false;
    provider.rejectionReason = reason;
    provider.verifiedBy = req.user._id;
    provider.verifiedAt = new Date();

    // Add verification log
    provider.addVerificationLog('REJECTED', req.user._id, reason);

    await provider.save();

    const populatedProvider = await ServiceProvider.findById(provider._id)
      .populate('user', 'name email')
      .populate('verifiedBy', 'name email');

    res.json({
      message: 'Service provider rejected',
      provider: populatedProvider
    });
  } catch (error) {
    console.error('Reject provider error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Suspend service provider
// @route   PATCH /api/admin/providers/:id/suspend
// @access  Private (ADMIN only)
const suspendProvider = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Suspension reason is required' });
    }

    const provider = await ServiceProvider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    provider.verificationStatus = 'SUSPENDED';
    provider.suspended = true;
    provider.suspensionReason = reason;

    // Add verification log
    provider.addVerificationLog('SUSPENDED', req.user._id, reason);

    await provider.save();

    const populatedProvider = await ServiceProvider.findById(provider._id)
      .populate('user', 'name email')
      .populate('verifiedBy', 'name email');

    res.json({
      message: 'Service provider suspended',
      provider: populatedProvider
    });
  } catch (error) {
    console.error('Suspend provider error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reinstate service provider
// @route   PATCH /api/admin/providers/:id/reinstate
// @access  Private (ADMIN only)
const reinstateProvider = async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    provider.verificationStatus = 'APPROVED';
    provider.suspended = false;
    provider.suspensionReason = undefined;

    // Add verification log
    provider.addVerificationLog('REINSTATED', req.user._id);

    await provider.save();

    const populatedProvider = await ServiceProvider.findById(provider._id)
      .populate('user', 'name email')
      .populate('verifiedBy', 'name email');

    res.json({
      message: 'Service provider reinstated',
      provider: populatedProvider
    });
  } catch (error) {
    console.error('Reinstate provider error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Check for duplicate documents (fraud prevention)
// @route   POST /api/admin/providers/check-duplicates
// @access  Private (ADMIN only)
const checkDuplicateDocuments = async (req, res) => {
  try {
    const { ownerIdProof, businessProof } = req.body;

    const duplicates = {
      ownerIdProof: [],
      businessProof: []
    };

    if (ownerIdProof) {
      const dupOwnerIds = await ServiceProvider.find({ 
        ownerIdProof,
        _id: { $ne: req.body.excludeId }
      }).populate('user', 'name email');
      duplicates.ownerIdProof = dupOwnerIds;
    }

    if (businessProof) {
      const dupBusinessProofs = await ServiceProvider.find({ 
        businessProof,
        _id: { $ne: req.body.excludeId }
      }).populate('user', 'name email');
      duplicates.businessProof = dupBusinessProofs;
    }

    const hasDuplicates = duplicates.ownerIdProof.length > 0 || duplicates.businessProof.length > 0;

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
  getPendingProviders,
  getAllProviders,
  getProviderDetails,
  approveProvider,
  rejectProvider,
  suspendProvider,
  reinstateProvider,
  checkDuplicateDocuments
};
