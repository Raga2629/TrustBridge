const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { createNotification } = require('./notificationController');

// @desc    Book a service
// @route   POST /api/bookings
// @access  Private (USER only)
const bookService = async (req, res) => {
  try {
    const { serviceId, bookingDate, bookingTime } = req.body;

    // Validation
    if (!serviceId || !bookingDate || !bookingTime) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      service: serviceId,
      bookingDate,
      bookingTime
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email phone')
      .populate('service', 'name category provider');

    // Create notification for user
    await createNotification(
      req.user._id,
      'booking',
      'Booking Confirmed',
      `Your booking for ${service.name} on ${new Date(bookingDate).toLocaleDateString()} at ${bookingTime} has been confirmed.`,
      '/my-bookings',
      { bookingId: booking._id, serviceId: service._id }
    );

    // Create notification for service provider if exists
    if (service.provider) {
      await createNotification(
        service.provider,
        'booking',
        'New Booking Received',
        `${req.user.name} booked ${service.name} for ${new Date(bookingDate).toLocaleDateString()} at ${bookingTime}.`,
        '/provider/bookings',
        { bookingId: booking._id, userId: req.user._id }
      );
    }

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('service', 'name category location provider')
      .populate({
        path: 'service',
        populate: {
          path: 'provider',
          select: 'name email phone'
        }
      })
      .sort('-createdAt');

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get bookings for provider's services
// @route   GET /api/bookings/provider
// @access  Private (PROVIDER only)
const getProviderBookings = async (req, res) => {
  try {
    // Get all services by this provider
    const services = await Service.find({ provider: req.user._id });
    const serviceIds = services.map(s => s._id);

    // Get all bookings for these services
    const bookings = await Booking.find({ service: { $in: serviceIds } })
      .populate('user', 'name email phone')
      .populate('service', 'name category location')
      .sort('-createdAt');

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept/Reject booking
// @route   PUT /api/bookings/:id/status
// @access  Private (PROVIDER only)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Accepted', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id).populate('service');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the provider owns this service
    if (booking.service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (USER only)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reschedule booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private (USER only)
const rescheduleBooking = async (req, res) => {
  try {
    const { bookingDate, bookingTime } = req.body;

    if (!bookingDate || !bookingTime) {
      return res.status(400).json({ message: 'Please provide new date and time' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reschedule this booking' });
    }

    if (booking.status === 'Completed' || booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot reschedule completed or cancelled booking' });
    }

    booking.bookingDate = bookingDate;
    booking.bookingTime = bookingTime;
    booking.status = 'Pending';
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  bookService,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking
};
