const asyncHandler = require('express-async-handler');
const chatService = require('../services/chatService');

const getMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const messages = await chatService.getMessages(roomId);
  res.json(messages);
});

module.exports = { getMessages };