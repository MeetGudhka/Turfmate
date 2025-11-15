const db = require('../config/db');

const createCheckin = async (bookingId, token, expiresAt) => {
  await db.query(
    'INSERT INTO checkins (booking_id, token, expires_at) VALUES ($1, $2, $3)',
    [bookingId, token, expiresAt]
  );
};

const findValidCheckinByToken = async (token) => {
  const res = await db.query(
    `SELECT c.*, b.user_id 
     FROM checkins c
     JOIN bookings b ON c.booking_id = b.id
     WHERE c.token = $1 AND c.expires_at > NOW() AND c.checked_in_at IS NULL`,
    [token]
  );
  return res.rows[0] || null;
};

const markAsCheckedIn = async (checkinId, bookingId) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE checkins SET checked_in_at = NOW() WHERE id = $1', [checkinId]);
    await client.query('UPDATE bookings SET status = $1 WHERE id = $2', ['checked_in', bookingId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { createCheckin, findValidCheckinByToken, markAsCheckedIn };