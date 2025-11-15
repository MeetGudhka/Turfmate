const db = require('../config/db');

const createTeam = async (name, captainId) => {
  const res = await db.query(
    'INSERT INTO teams (name, captain_id) VALUES ($1, $2) RETURNING *',
    [name, captainId]
  );
  return res.rows[0];
};

const addMemberToTeam = async (teamId, userId) => {
  await db.query(
    'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [teamId, userId]
  );
};

module.exports = { createTeam, addMemberToTeam };