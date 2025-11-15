const express = require('express');
const { getNotifications } = require('../controllers/notification.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticateToken, getNotifications);

module.exports = router;