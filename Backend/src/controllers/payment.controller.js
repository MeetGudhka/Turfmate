const asyncHandler = require('express-async-handler');
const paymentService = require('../services/paymentService');
const bookingModel = require('../models/booking.model');

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { bookingId, amount } = req.body;
  const order = await paymentService.createOrder(amount, 'INR', bookingId);
  res.json(order);
});

const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const isValid = paymentService.verifySignature(req.body, signature);
  if (!isValid) return res.status(400).send('Invalid signature');

  const { payload } = req.body;
  const payment = payload.payment.entity;
  const bookingId = payment.notes?.bookingId;

  if (payment.status === 'captured') {
    await paymentService.updateBookingPayment(bookingId, payment.id, payment.order_id);
  }

  res.status(200).send('OK');
});

module.exports = { createPaymentOrder, handleWebhook };