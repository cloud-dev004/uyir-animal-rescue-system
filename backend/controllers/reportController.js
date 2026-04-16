const Report = require('../models/Report');
const User = require('../models/User');
const Case = require('../models/Case');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Resolve a rescue case (Volunteer) and create case history
// @route   PUT /api/reports/:id/resolve
// @access  Public
const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) return errorResponse(res, 404, 'Case not found.');
    if (report.status === 'closed' || report.status === 'resolved') {
        return errorResponse(res, 400, 'Case is already resolved.');
    }

    report.status = 'closed';
    report.resolvedAt = new Date();
    await report.save();

    // 1) Store in Cases History First
    const newCase = new Case({
      reportId: report._id,
      caseId: report.caseId,
      volunteerId: report.assignedTo,
      animalType: report.animalType,
      severity: report.severity,
      address: report.address,
      description: report.description,
      status: 'closed',
      resolvedAt: report.resolvedAt,
      creditsEarned: 10
    });
    await newCase.save();

    // 2) Update Volunteer stats based on calculated count
    if (report.assignedTo) {
      const user = await User.findById(report.assignedTo);
      if (user) {
         // Dynamically grab rescue count
         const actualRescueCount = await Case.countDocuments({ volunteerId: user._id });

         user.credits = (user.credits || 0) + 10;
         user.rescueCount = actualRescueCount; // Assign exactly from Mongo cases collection
         
         if (user.credits < 100) user.badge = 'bronze';
         else if (user.credits >= 100 && user.credits < 400) user.badge = 'silver';
         else if (user.credits >= 400) user.badge = 'gold';

         await user.save();
      }
    }

    // 3) Send SMS to reporter
    if (report.reporterPhone) {
        const sendSMS = require('../utils/sendSMS');
        const message = `Alert: Your animal rescue report (${report.caseId} - ${report.animalType}) has been successfully RESOLVED by our volunteer! Thank you for using the Uyir Rescue Network.`;
        await sendSMS(report.reporterPhone, message);
    }

    return successResponse(res, 200, 'Case resolved successfully.', report);
  } catch (error) {
    console.error('Error resolving case:', error);
    return errorResponse(res, 500, 'Server error while resolving case.');
  }
};

// @desc    Create a new citizen report
// @route   POST /api/reports
// @access  Public (or Citizen)
const createReport = async (req, res) => {
  try {
    const {
      reporterPhone,
      animalType,
      severity,
      description,
      location, // assuming frontend sends structured location { type: 'Point', coordinates: [lng, lat] }
      address,
      city,
      area,
      photos
    } = req.body;

    // Validate essential fields
    if (!reporterPhone || !animalType) {
      return errorResponse(res, 400, 'Please provide reporter phone and animal type at minimum.');
    }

    // Generate unique Case ID
    // E.g. UYR-2026-RANDOM4
    const caseIdString = `UYR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReport = new Report({
      caseId: caseIdString,
      reporterPhone,
      animalType,
      severity: severity || 'moderate',
      description,
      location: location || { type: 'Point', coordinates: [0, 0] }, // Default 0,0 if not provided
      address: address || `${area ? area + ', ' : ''}${city || ''}`,
      city,
      area,
      photos: photos || [],
      status: 'open'
    });

    const savedReport = await newReport.save();

    return successResponse(res, 201, 'Report created successfully.', savedReport);

  } catch (error) {
    console.error('Error creating report:', error);

    if (error.code === 11000) {
      return errorResponse(res, 400, 'A report with this Case ID already exists.');
    }

    return errorResponse(res, 500, 'Server error while creating report.', error.message);
  }
};

// @desc    Track an existing case by caseId
// @route   GET /api/reports/track/:caseId
// @access  Public
const trackReport = async (req, res) => {
  try {
    const { caseId } = req.params;

    const report = await Report.findOne({ caseId });

    if (!report) {
      return errorResponse(res, 404, 'Case not found! Please check your tracking ID.');
    }

    return successResponse(res, 200, 'Case retrieved successfully.', report);
  } catch (error) {
    console.error('Error tracking report:', error);
    return errorResponse(res, 500, 'Server error while tracking report.', error.message);
  }
};

// @desc    Get dashboard metrics (live stats)
// @route   GET /api/reports/stats
// @access  Public
const getSystemStats = async (req, res) => {
  try {
    const openCasesCount = await Report.countDocuments({ status: 'open' });
    const availableVolunteers = await User.countDocuments({ role: 'volunteer', isAvailable: true });

    return successResponse(res, 200, 'Stats retrieved successfully.', {
      openCases: openCasesCount,
      avgResponse: '14m', // static for now
      volunteersOnline: availableVolunteers
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return errorResponse(res, 500, 'Server error while fetching stats.');
  }
};

// @desc    Get all open cases
// @route   GET /api/reports/open
// @access  Public (or Volunteer)
const getOpenReports = async (req, res) => {
  try {
    const reports = await Report.find({ status: 'open' }).sort({ createdAt: -1 });
    return successResponse(res, 200, 'Open cases retrieved successfully.', reports);
  } catch (error) {
    console.error('Error fetching open cases:', error);
    return errorResponse(res, 500, 'Server error while fetching open cases.');
  }
};

// @desc    Accept a rescue case (Volunteer)
// @route   POST /api/reports/:id/accept
// @access  Public
const acceptReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) return errorResponse(res, 400, 'Volunteer ID is required.');

    const report = await Report.findById(id);
    if (!report) return errorResponse(res, 404, 'Case not found.');
    if (report.status !== 'open') return errorResponse(res, 400, 'Case is already assigned or closed.');

    report.status = 'assigned';
    report.assignedTo = userId;
    await report.save();

    // Rescue count is NO LONGER incremented here. It happens on resolve.

    return successResponse(res, 200, 'Case accepted successfully.', report);
  } catch (error) {
    console.error('Error accepting case:', error);
    return errorResponse(res, 500, 'Server error while accepting case.');
  }
};

// @desc    Get user's assigned cases
// @route   GET /api/reports/assigned/:userId
// @access  Public
const getMyReports = async (req, res) => {
  try {
    const { userId } = req.params;
    const reports = await Report.find({ assignedTo: userId }).sort({ createdAt: -1 });
    return successResponse(res, 200, 'Assigned cases retrieved successfully.', reports);
  } catch (error) {
    console.error('Error fetching assigned cases:', error);
    return errorResponse(res, 500, 'Server error while fetching assigned cases.');
  }
};

module.exports = {
  createReport,
  trackReport,
  getSystemStats,
  getOpenReports,
  acceptReport,
  getMyReports,
  resolveReport
};
