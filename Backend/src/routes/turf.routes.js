const express = require('express');
const { createTurf, getTurfs, getOwnerTurfs } = require('../controllers/turf.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('owner'), createTurf);
router.get('/', authenticateToken, getTurfs);
router.get('/my', authenticateToken, authorizeRoles('owner'), getOwnerTurfs);

module.exports = router;