const asyncHandler = require('express-async-handler');
const adminService = require('../services/adminService');

const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminService.getAnalytics();
  res.json(analytics);
});

module.exports = { getAnalytics };