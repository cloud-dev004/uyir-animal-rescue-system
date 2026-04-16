const Report = require('../models/Report');
const User = require('../models/User');
const VetClinic = require('../models/VetClinic');
const Drive = require('../models/Drive');
const Adoption = require('../models/Adoption');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all reports across whole system
// @route   GET /api/admin/reports
const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find({}).sort({ createdAt: -1 });
        return successResponse(res, 200, "Fetched all reports", reports);
    } catch (error) {
        console.error('Error fetching admin reports:', error);
        return errorResponse(res, 500, "Server error fetching reports");
    }
};

// @desc    Get all volunteers
// @route   GET /api/admin/volunteers
const getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await User.find({ role: 'volunteer' }).sort({ createdAt: -1 });
        return successResponse(res, 200, "Fetched volunteers", volunteers);
    } catch (error) {
        console.error('Error fetching admin volunteers:', error);
        return errorResponse(res, 500, "Server error fetching volunteers");
    }
};

// @desc    Get all vet clinics
// @route   GET /api/admin/vetclinics
const getAllVetClinics = async (req, res) => {
    try {
        const clinics = await VetClinic.find({}).sort({ name: 1 });
        return successResponse(res, 200, "Fetched vet clinics", clinics);
    } catch (error) {
        console.error('Error fetching admin vet clinics:', error);
        return errorResponse(res, 500, "Server error fetching vet clinics");
    }
};

// @desc    Get all drives
// @route   GET /api/admin/drives
const getAllDrives = async (req, res) => {
    try {
        const drives = await Drive.find({}).sort({ scheduledDate: 1 });
        return successResponse(res, 200, "Fetched drives", drives);
    } catch (error) {
        console.error('Error fetching admin drives:', error);
        return errorResponse(res, 500, "Server error fetching drives");
    }
};

// @desc    Get all adoptions
// @route   GET /api/admin/adoptions
const getAllAdoptions = async (req, res) => {
    try {
        const adoptions = await Adoption.find({});
        return successResponse(res, 200, "Fetched adoptions", adoptions);
    } catch (error) {
        console.error('Error fetching admin adoptions:', error);
        return errorResponse(res, 500, "Server error fetching adoptions");
    }
};

module.exports = {
    getAllReports,
    getAllVolunteers,
    getAllVetClinics,
    getAllDrives,
    getAllAdoptions
};
