const asyncHandler = require('express-async-handler');
const notificationService = require('../services/notificationService');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(req.user.id);
  res.json(notifications);
});

module.exports = { getNotifications };