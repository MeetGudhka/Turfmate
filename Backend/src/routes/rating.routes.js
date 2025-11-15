const express = require('express');
const { submitRating } = require('../controllers/rating.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticateToken, submitRating);

module.exports = router;