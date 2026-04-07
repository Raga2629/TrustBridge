const ServiceReport = require('../models/ServiceReport');
const Service = require('../models/Service');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { onReportReceived } = require('../utils/trustEngine');

const REPORT_THRESHOLD = 5; // auto-suspend after this many reports

// ─────────────────────────────────────────────
// Helper: notify all admins
// ─────────────────────────────────────────────
const notifyAdmins = async (title, message, link) => {
  try {
    const admins = await User.find({ role: 'ADMIN' }).select('_id');
    await Promise.all(
      admins.map(admin =>
        createNotification(admin._id, 'system', title, message, link)
      )
    );
  } catch (err) {
    console.error('Admin notification error:', err.message);
  }
};

// ─────────────────────────────────────────────
// POST /api/reports
// User submits a report
// ─────────────────────────────────────────────
const submitReport = async (req, res) => {
  try {
    const { serviceId, reason, description } = req.body;

    if (!serviceId || !reason) {
      return res.status(400).json({ message: 'serviceId and reason are required' });
    }

    const validReasons = ['fake_service', 'scam', 'wrong_info', 'closed_business', 'inappropriate', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ message: 'Invalid reason' });
    }

    // Check service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Prevent duplicate report
    const existing = await ServiceReport.findOne({ serviceId, userId: req.user._id });
    if (existing) {
      return res.status(409).json({ message: 'You have already reported this service.' });
    }

    // Create report
    const report = await ServiceReport.create({
      serviceId,
      userId: req.user._id,
      reason,
      description: description?.trim() || '',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown'
    });

    // Count total reports for this service
    const reportCount = await ServiceReport.countDocuments({ serviceId });

    // Deduct trust from the service provider
    if (service.provider) {
      await onReportReceived(service.provider);
    }

    let autoSuspended = false;

    // Auto-suspend if threshold reached
    if (reportCount >= REPORT_THRESHOLD && service.verified !== false) {
      await Service.findByIdAndUpdate(serviceId, {
        verified: false,
        isVerified: false
      });
      autoSuspended = true;

      // Notify admins
      await notifyAdmins(
        '⚠️ Service Auto-Suspended',
        `"${service.name}" has been auto-suspended after receiving ${reportCount} community reports.`,
        `/admin/reports`
      );

      console.log(`🚨 Service "${service.name}" auto-suspended after ${reportCount} reports`);
    } else if (reportCount === 1) {
      // First report — alert admins
      await notifyAdmins(
        '🚩 New Service Report',
        `"${service.name}" has been reported for: ${reason.replace(/_/g, ' ')}.`,
        `/admin/reports`
      );
    }

    res.status(201).json({
      message: 'Report submitted successfully. Our team will review it.',
      reportId: report._id,
      totalReports: reportCount,
      autoSuspended
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already reported this service.' });
    }
    console.error('Submit report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/reports/service/:serviceId
// Check if current user already reported a service
// ─────────────────────────────────────────────
const checkUserReport = async (req, res) => {
  try {
    const report = await ServiceReport.findOne({
      serviceId: req.params.serviceId,
      userId: req.user._id
    });
    const count = await ServiceReport.countDocuments({ serviceId: req.params.serviceId });
    res.json({ hasReported: !!report, totalReports: count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/reports/admin/all
// Admin: get all reports with filters
// ─────────────────────────────────────────────
const getAllReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      ServiceReport.find(filter)
        .populate('serviceId', 'name category area city verified isVerified')
        .populate('userId', 'name email')
        .populate('reviewedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ServiceReport.countDocuments(filter)
    ]);

    // Group by service for summary
    const serviceSummary = await ServiceReport.aggregate([
      { $group: { _id: '$serviceId', count: { $sum: 1 }, reasons: { $push: '$reason' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      reports,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      page: parseInt(page),
      serviceSummary
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/reports/admin/service/:serviceId
// Admin: all reports for a specific service
// ─────────────────────────────────────────────
const getReportsByService = async (req, res) => {
  try {
    const reports = await ServiceReport.find({ serviceId: req.params.serviceId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const service = await Service.findById(req.params.serviceId).select('name category verified isVerified');

    res.json({ service, reports, total: reports.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// PUT /api/reports/admin/:id
// Admin: review a single report
// ─────────────────────────────────────────────
const reviewReport = async (req, res) => {
  try {
    const { status, adminNote, serviceAction } = req.body;
    // status: reviewed | dismissed | action_taken
    // serviceAction: suspend | restore | none

    const validStatuses = ['reviewed', 'dismissed', 'action_taken'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await ServiceReport.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote: adminNote || null,
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('serviceId', 'name');

    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Optionally act on the service
    if (serviceAction === 'suspend') {
      await Service.findByIdAndUpdate(report.serviceId._id, { verified: false, isVerified: false });
    } else if (serviceAction === 'restore') {
      await Service.findByIdAndUpdate(report.serviceId._id, { verified: true, isVerified: true });
    }

    res.json({ message: `Report marked as ${status}`, report });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// PUT /api/reports/admin/service/:serviceId/action
// Admin: bulk action on all reports for a service
// ─────────────────────────────────────────────
const bulkServiceAction = async (req, res) => {
  try {
    const { action } = req.body; // suspend | restore | dismiss_all

    const service = await Service.findById(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (action === 'suspend') {
      await Service.findByIdAndUpdate(req.params.serviceId, { verified: false, isVerified: false });
      await ServiceReport.updateMany(
        { serviceId: req.params.serviceId, status: 'pending' },
        { status: 'action_taken', reviewedBy: req.user._id, reviewedAt: new Date() }
      );
    } else if (action === 'restore') {
      await Service.findByIdAndUpdate(req.params.serviceId, { verified: true, isVerified: true });
      await ServiceReport.updateMany(
        { serviceId: req.params.serviceId },
        { status: 'dismissed', reviewedBy: req.user._id, reviewedAt: new Date() }
      );
    } else if (action === 'dismiss_all') {
      await ServiceReport.updateMany(
        { serviceId: req.params.serviceId, status: 'pending' },
        { status: 'dismissed', reviewedBy: req.user._id, reviewedAt: new Date() }
      );
    }

    res.json({ message: `Action "${action}" applied to service "${service.name}"` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  submitReport,
  checkUserReport,
  getAllReports,
  getReportsByService,
  reviewReport,
  bulkServiceAction
};
