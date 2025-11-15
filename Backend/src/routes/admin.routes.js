const express = require('express');
const { getAnalytics } = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const router = express.Router();

router.get('/analytics', authenticateToken, authorizeRoles('admin'), getAnalytics);

module.exports = router;