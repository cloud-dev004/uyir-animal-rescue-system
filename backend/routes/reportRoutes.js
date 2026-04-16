const express = require('express');
const router = express.Router();
const { createReport, trackReport, getSystemStats, getOpenReports, acceptReport, getMyReports, resolveReport } = require('../controllers/reportController');

// Route: POST /api/reports
router.post('/', createReport);

// Route: GET /api/reports/open
router.get('/open', getOpenReports);

// Route: GET /api/reports/stats
router.get('/stats', getSystemStats);

// Route: GET /api/reports/track/:caseId
router.get('/track/:caseId', trackReport);

// Route: POST /api/reports/:id/accept
router.post('/:id/accept', acceptReport);

// Route: GET /api/reports/assigned/:userId
router.get('/assigned/:userId', getMyReports);

// Route: PUT /api/reports/:id/resolve
router.put('/:id/resolve', resolveReport);

module.exports = router;
