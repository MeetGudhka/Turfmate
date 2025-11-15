const turfModel = require('../models/turf.model');

const createTurf = async (ownerId, name, address, pricePerHour, description, imageUrl) => {
  return await turfModel.createTurf(name, address, ownerId, pricePerHour, description, imageUrl);
};

const getTurfs = async (filters = {}) => {
  return await turfModel.getTurfs(filters);
};

module.exports = { createTurf, getTurfs };