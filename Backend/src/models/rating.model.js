const db = require('../config/db');

const createRating = async (bookingId, raterId, ratedUserId, rating, comment) => {
  await db.query(
    `INSERT INTO ratings (booking_id, rater_id, rated_user_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)`,
    [bookingId, raterId, ratedUserId, rating, comment]
  );
};

const getRatingsForUser = async (userId) => {
  const res = await db.query(
    `SELECT r.*, u.name as rater_name
     FROM ratings r
     JOIN users u ON r.rater_id = u.id
     WHERE r.rated_user_id = $1`,
    [userId]
  );
  return res.rows;
};

module.exports = { createRating, getRatingsForUser };