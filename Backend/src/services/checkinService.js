// src/services/checkinService.js
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const generateCheckinToken = async (bookingId, userId) => {
  const client = await db.connect();
  try {
    // Verify booking belongs to user
    const bookingRes = await client.query(
      `SELECT id FROM bookings WHERE id = $1 AND user_id = $2 AND status = 'confirmed'`,
      [bookingId, userId]
    );
    if (bookingRes.rows.length === 0) {
      throw new Error('Booking not found, not yours, or not confirmed');
    }

    const token = uuidv4().substring(0, 32);
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    await client.query(
      `INSERT INTO checkins (booking_id, token, expires_at) VALUES ($1, $2, $3)`,
      [bookingId, token, expiresAt]
    );

    return { token, expiresAt };
  } finally {
    client.release();
  }
};

const verifyCheckinToken = async (token) => {
  const client = await db.connect();
  try {
    const checkinRes = await client.query(
      `SELECT c.*, b.user_id, b.turf_id 
       FROM checkins c
       JOIN bookings b ON c.booking_id = b.id
       WHERE c.token = $1 AND c.expires_at > NOW() AND c.checked_in_at IS NULL`,
      [token]
    );

    if (checkinRes.rows.length === 0) {
      throw new Error('Invalid or expired token');
    }

    const checkin = checkinRes.rows[0];

    // Mark as checked in
    await client.query(`UPDATE checkins SET checked_in_at = NOW() WHERE id = $1`, [checkin.id]);
    await client.query(`UPDATE bookings SET status = 'checked_in' WHERE id = $1`, [checkin.booking_id]);

    return {
      bookingId: checkin.booking_id,
      userId: checkin.user_id,
      turfId: checkin.turf_id,
    };
  } finally {
    client.release();
  }
};

module.exports = { generateCheckinToken, verifyCheckinToken };