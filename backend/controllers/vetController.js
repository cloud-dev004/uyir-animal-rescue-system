const Report = require('../models/Report');
const VetClinic = require('../models/VetClinic');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get dashboard metrics and active pipeline for the Vet 
// @route   GET /api/vet/dashboard
// @access  Public (mocked auth for now)
const getVetDashboard = async (req, res) => {
    try {
        // Fetch static mock capacity for UI display (since true login auth isn't fully linking a dynamic VetClinic document yet)
        const clinicStats = {
            capacity: 10,
            animalsInClinic: 8,
            incomingToday: 3,
            underTreatment: 5,
            recoveredThisWeek: 22,
            adoptionReady: 5
        };

        // Fetch reports actively assigned or en-route to a clinic (using 'assigned' as proxy since we simulate dispatch)
        const incomingHandovers = await Report.find({ 
            status: { $in: ['open', 'assigned', 'en-route'] } 
        })
        .populate('assignedTo', 'name phone') // Load volunteer data
        .sort({ createdAt: -1 })
        .limit(3);

        return successResponse(res, 200, 'Vet dashboard loaded successfully.', {
            stats: clinicStats,
            incoming: incomingHandovers
        });

    } catch (error) {
        console.error('Error fetching vet dashboard:', error);
        return errorResponse(res, 500, 'Server error while fetching vet data.');
    }
};

module.exports = {
    getVetDashboard
};
