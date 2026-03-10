const express = require('express');
const { reportEntity, getMyComplaints } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, reportEntity);
router.get('/my', protect, getMyComplaints);
router.put('/:id', protect, async (req, res) => {
  try {
    const Complaint = require('../models/Complaint');
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { status } = req.body;
    if (status) complaint.status = status;
    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
