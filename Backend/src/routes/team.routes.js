const express = require('express');
const { createTeam } = require('../controllers/team.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticateToken, createTeam);

module.exports = router;