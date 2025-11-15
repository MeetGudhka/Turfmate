const asyncHandler = require('express-async-handler');
const ratingService = require('../services/ratingService');

const submitRating = asyncHandler(async (req, res) => {
  const { bookingId, ratedUserId, rating, comment } = req.body;
  await ratingService.submitRating(req.user.id, bookingId, ratedUserId, rating, comment);
  res.status(201).json({ success: true });
});

module.exports = { submitRating };