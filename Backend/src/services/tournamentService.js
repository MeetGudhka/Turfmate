const db = require('../config/db');

const createTournament = async (name, turfId, startDate, endDate, entryFee, prizePool) => {
  const res = await db.query(
    `INSERT INTO tournaments (name, turf_id, start_date, end_date, entry_fee, prize_pool)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, turfId, startDate, endDate, entryFee, prizePool]
  );
  return res.rows[0];
};

module.exports = { createTournament };