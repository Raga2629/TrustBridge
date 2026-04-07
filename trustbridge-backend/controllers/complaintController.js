const Complaint = require('../models/Complaint');

// @desc    Report service or local resident
// @route   POST /api/complaints
// @access  Private
const reportEntity = async (req, res) => {
  try {
    const { reportedType, reportedId, reason } = req.body;

    // Validation
    if (!reportedType || !reportedId || !reason) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!['SERVICE', 'LOCAL'].includes(reportedType)) {
      return res.status(400).json({ message: 'Invalid reported type' });
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      reportedType,
      reportedId,
      reason
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('user', 'name email');

    res.status(201).json(populatedComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my complaints
// @route   GET /api/complaints/my
// @access  Private
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .sort('-createdAt');

    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { reportEntity, getMyComplaints };
