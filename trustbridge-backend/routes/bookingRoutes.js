const express = require('express');
const {
  bookService,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, authorize('USER'), bookService);
router.get('/user', protect, authorize('USER'), getMyBookings);
router.get('/my', protect, getMyBookings);
router.get('/provider', protect, authorize('PROVIDER'), getProviderBookings);
router.put('/:id/status', protect, authorize('PROVIDER'), updateBookingStatus);
router.put('/:id/cancel', protect, authorize('USER'), cancelBooking);
router.put('/:id/reschedule', protect, authorize('USER'), rescheduleBooking);
router.delete('/:id', protect, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
