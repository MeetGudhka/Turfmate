const express = require('express');
const { getMessages } = require('../controllers/chat.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/room/:roomId', authenticateToken, getMessages);

module.exports = router;