const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { generateQR } = require('../utils/qrgen');

const generateCheckinToken = async (req, res) => {
  const { bookingId } = req.params;
  const { userId } = req.user;

  const client = await db.connect();
  try {
    // Verify booking belongs to user
    const bookingRes = await client.query(
      `SELECT id FROM bookings WHERE id = $1 AND user_id = $2`,
      [bookingId, userId]
    );
    if (bookingRes.rows.length === 0) {
      return res.status(403).json({ error: 'Booking not found or not yours' });
    }

    const token = uuidv4().substring(0, 32);
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    await client.query(
      `INSERT INTO checkins (booking_id, token, expires_at) VALUES ($1, $2, $3)`,
      [bookingId, token, expiresAt]
    );

    const qrDataUrl = await generateQR(`http://localhost:5000/api/checkin/verify?token=${token}`);

    res.json({ token, qrCode: qrDataUrl, expiresAt });
  } finally {
    client.release();
  }
};

const verifyCheckin = async (req, res) => {
  const { token } = req.body || req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }

  const client = await db.connect();
  try {
    const checkinRes = await client.query(
      `SELECT * FROM checkins 
       WHERE token = $1 AND expires_at > NOW() AND checked_in_at IS NULL`,
      [token]
    );

    if (checkinRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const checkin = checkinRes.rows[0];
    await client.query(
      `UPDATE checkins SET checked_in_at = NOW() WHERE id = $1`,
      [checkin.id]
    );

    await client.query(
      `UPDATE bookings SET status = 'checked_in' WHERE id = $1`,
      [checkin.booking_id]
    );

    res.json({ success: true, message: 'Check-in successful' });
  } finally {
    client.release();
  }
};

module.exports = { generateCheckinToken, verifyCheckin };