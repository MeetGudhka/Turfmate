const db = require('../config/db');

const createTeam = async (captainId, name) => {
  const res = await db.query(
    'INSERT INTO teams (name, captain_id) VALUES ($1, $2) RETURNING *',
    [name, captainId]
  );
  return res.rows[0];
};

module.exports = { createTeam };