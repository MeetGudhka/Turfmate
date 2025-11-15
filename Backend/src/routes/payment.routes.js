const express = require('express');
const { createPaymentOrder, handleWebhook } = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/order', authenticateToken, createPaymentOrder);
router.post('/webhook', handleWebhook); // No auth — Razorpay calls this

module.exports = router;