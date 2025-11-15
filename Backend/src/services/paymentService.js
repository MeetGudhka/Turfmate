// Razorpay integration with fallback stub
const Razorpay = require('razorpay');
const db = require('../config/db');

let razorpay;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const createOrder = async (amount, currency = 'INR', receipt) => {
  if (!razorpay) {
    // Stub for development
    return {
      id: `order_stub_${Date.now()}`,
      amount: amount * 100, // Razorpay uses paise
      currency,
      receipt,
    };
  }

  const options = {
    amount: amount * 100,
    currency,
    receipt,
  };

  return await razorpay.orders.create(options);
};

const verifySignature = (body, signature) => {
  if (!razorpay) return true; // Skip in dev

  const generatedSignature = razorpay.utils.verifyWebhookSignature(
    JSON.stringify(body),
    signature,
    process.env.RAZORPAY_WEBHOOK_SECRET
  );
  return generatedSignature;
};

const updateBookingPayment = async (bookingId, paymentId, orderId) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE bookings 
       SET status = 'confirmed', razorpay_payment_id = $1, razorpay_order_id = $2, updated_at = NOW()
       WHERE id = $3`,
      [paymentId, orderId, bookingId]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { createOrder, verifySignature, updateBookingPayment };