const db = require('../config/db');

const createTransaction = async (userId, amount, type, description, bookingId = null) => {
  await db.query(
    `INSERT INTO transactions (user_id, amount, type, description, booking_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, amount, type, description, bookingId]
  );
};

module.exports = { createTransaction };