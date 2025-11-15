const asyncHandler = require('express-async-handler');
const bookingService = require('../services/bookingService');

const createBooking = asyncHandler(async (req, res) => {
  const { turfId, startTime, endTime } = req.body;
  const booking = await bookingService.createBooking(req.user.id, turfId, new Date(startTime), new Date(endTime));
  res.status(201).json(booking);
});

const getBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getUserBookings(req.user.id);
  res.json(bookings);
});

module.exports = { createBooking, getBookings };