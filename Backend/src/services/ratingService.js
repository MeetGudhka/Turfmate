const db = require('../config/db');
const { updateSkillScore } = require('../utils/skillScore');

const submitRating = async (raterId, bookingId, ratedUserId, rating, comment) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO ratings (booking_id, rater_id, rated_user_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [bookingId, raterId, ratedUserId, rating, comment]
    );

    // Update skill score (simplified: assume rater won)
    const rater = await client.query('SELECT skill_score FROM users WHERE id = $1', [raterId]);
    const rated = await client.query('SELECT skill_score FROM users WHERE id = $1', [ratedUserId]);

    if (rater.rows[0] && rated.rows[0]) {
      const scores = updateSkillScore(rater.rows[0].skill_score, rated.rows[0].skill_score);
      await client.query('UPDATE users SET skill_score = $1 WHERE id = $2', [scores.winner, raterId]);
      await client.query('UPDATE users SET skill_score = $1 WHERE id = $2', [scores.loser, ratedUserId]);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { submitRating };