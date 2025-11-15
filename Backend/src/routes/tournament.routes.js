const express = require('express');
const { createTournament } = require('../controllers/tournament.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { isOwnerOfTurf } = require('../middleware/turfOwner.middleware');

const router = express.Router();

router.post('/', authenticateToken, isOwnerOfTurf, createTournament);

module.exports = router;