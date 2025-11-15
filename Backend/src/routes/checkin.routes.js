const express = require('express');
const asyncHandler = require('express-async-handler');
const checkinController = require('../controllers/checkin.controller');

const router = express.Router();

// Generate QR for booking
router.post('/generate/:bookingId', asyncHandler(checkinController.generateCheckinToken));

// Verify QR scan (simulate with curl)
router.post('/verify', asyncHandler(checkinController.verifyCheckin));

module.exports = router;