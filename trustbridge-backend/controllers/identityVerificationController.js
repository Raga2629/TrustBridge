const path = require('path');
const IdentityVerification = require('../models/IdentityVerification');
const { compareFaces, MATCH_THRESHOLD } = require('../utils/faceMatchService');
const { onIdentityVerified } = require('../utils/trustEngine');

/**
 * @desc  Upload ID + selfie and run face match
 * @route POST /api/identity-verification/upload
 * @access Private (any logged-in user)
 */
const uploadAndVerify = async (req, res) => {
  try {
    if (!req.files || !req.files.idImage || !req.files.selfieImage) {
      return res.status(400).json({ message: 'Both idImage and selfieImage are required' });
    }

    const idImagePath = req.files.idImage[0].path;
    const selfieImagePath = req.files.selfieImage[0].path;

    // Relative paths for DB storage (served via /uploads)
    const idImageUrl = idImagePath.replace(/\\/g, '/').split('uploads/')[1];
    const selfieImageUrl = selfieImagePath.replace(/\\/g, '/').split('uploads/')[1];

    // Run face comparison
    const { matchScore, matched } = await compareFaces(
      path.resolve(idImagePath),
      path.resolve(selfieImagePath)
    );

    // Three-tier decision:
    // >= 75%  → auto verified (DeepFace confirmed same person)
    // 50-74%  → pending admin review (uncertain)
    // < 50%   → rejected (different person)
    let verificationStatus;
    let rejectionReason = null;

    if (matchScore >= 75) {
      verificationStatus = 'verified';
    } else if (matchScore >= 50) {
      verificationStatus = 'pending';
      rejectionReason = `Face match score ${matchScore}% requires admin review for confirmation.`;
    } else {
      verificationStatus = 'rejected';
      rejectionReason = `Face match score ${matchScore}% is too low. The selfie does not match the ID photo.`;
    }

    // Upsert — one record per user
    const record = await IdentityVerification.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        idImage: idImageUrl,
        selfieImage: selfieImageUrl,
        verificationStatus,
        matchScore,
        rejectionReason,
        reviewedBy: null,
        reviewedAt: null
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Award trust points only on auto-verified (high confidence)
    if (verificationStatus === 'verified') {
      await onIdentityVerified(req.user._id);
    }

    const messages = {
      verified: 'Identity verified successfully ✅',
      pending: 'Submitted for admin review. You will be notified once approved.',
      rejected: 'Face match failed. The selfie does not match the uploaded ID.'
    };

    res.status(200).json({
      message: messages[verificationStatus],
      verificationStatus: record.verificationStatus,
      matchScore: record.matchScore,
      idImage: `/uploads/${record.idImage}`,
      selfieImage: `/uploads/${record.selfieImage}`,
      rejectionReason: record.rejectionReason
    });
  } catch (error) {
    console.error('Identity verification error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

/**
 * @desc  Get current user's verification status
 * @route GET /api/identity-verification/status
 * @access Private
 */
const getStatus = async (req, res) => {
  try {
    const record = await IdentityVerification.findOne({ userId: req.user._id });

    if (!record) {
      return res.status(200).json({ verificationStatus: 'not_submitted', matchScore: null });
    }

    res.status(200).json({
      verificationStatus: record.verificationStatus,
      matchScore: record.matchScore,
      idImage: `/uploads/${record.idImage}`,
      selfieImage: `/uploads/${record.selfieImage}`,
      rejectionReason: record.rejectionReason,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Admin: get all pending verifications
 * @route GET /api/identity-verification/admin/all
 * @access Private (ADMIN)
 */
const getAllVerifications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { verificationStatus: status } : {};

    const records = await IdentityVerification.find(filter)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Admin: manually approve or reject
 * @route PUT /api/identity-verification/admin/:id
 * @access Private (ADMIN)
 */
const adminReview = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be verified or rejected' });
    }

    const record = await IdentityVerification.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: status,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!record) return res.status(404).json({ message: 'Record not found' });

    res.status(200).json({ message: `Verification ${status}`, record });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { uploadAndVerify, getStatus, getAllVerifications, adminReview };
