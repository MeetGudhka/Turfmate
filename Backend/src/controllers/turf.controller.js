const asyncHandler = require('express-async-handler');
const turfService = require('../services/turfService');

const createTurf = asyncHandler(async (req, res) => {
  const { name, address, pricePerHour, description, imageUrl } = req.body;
  const turf = await turfService.createTurf(req.user.id, name, address, pricePerHour, description, imageUrl);
  res.status(201).json(turf);
});

const getTurfs = asyncHandler(async (req, res) => {
  const turfs = await turfService.getTurfs();
  res.json(turfs);
});

const getOwnerTurfs = asyncHandler(async (req, res) => {
  const turfs = await turfService.getTurfs({ ownerId: req.user.id });
  res.json(turfs);
});

module.exports = { createTurf, getTurfs, getOwnerTurfs };