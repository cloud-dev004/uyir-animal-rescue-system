const express = require('express');
const router = express.Router();
const { getVetDashboard } = require('../controllers/vetController');

// All paths are prefixed with /api/vet in server.js
router.get('/dashboard', getVetDashboard);

module.exports = router;
