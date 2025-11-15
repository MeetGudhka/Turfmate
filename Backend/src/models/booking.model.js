const db = require('../config/db');

const createBooking = async (userId, slotId, turfId, amount) => {
  const res = await db.query(
    `INSERT INTO bookings (user_id, slot_id, turf_id, amount)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, slotId, turfId, amount]
  );
  return res.rows[0];
};

const getBookingById = async (id) => {
  const res = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
  return res.rows[0];
};

const updateBookingStatus = async (id, status) => {
  await db.query('UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
};

module.exports = { createBooking, getBookingById, updateBookingStatus };