const express = require('express');
const router = express.Router();
const {
    getAllReports,
    getAllVolunteers,
    getAllVetClinics,
    getAllDrives,
    getAllAdoptions
} = require('../controllers/adminController');

router.get('/reports', getAllReports);
router.get('/volunteers', getAllVolunteers);
router.get('/vetclinics', getAllVetClinics);
router.get('/drives', getAllDrives);
router.get('/adoptions', getAllAdoptions);

module.exports = router;
