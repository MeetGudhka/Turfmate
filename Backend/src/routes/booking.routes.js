const express = require('express');
const { createBooking, getBookings } = require('../controllers/booking.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticateToken, createBooking);
router.get('/', authenticateToken, getBookings);

module.exports = router;