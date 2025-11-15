const db = require('../config/db');
const bcrypt = require('bcrypt');

const createUser = async (name, email, password, phone, role = 'user') => {
  const hash = await bcrypt.hash(password, 10);
  const res = await db.query(
    `INSERT INTO users (name, email, password_hash, phone, role) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, email, hash, phone, role]
  );
  return res.rows[0];
};

const findUserByEmail = async (email) => {
  const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
};

const findUserById = async (id) => {
  const res = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
};

const updateUserSkillScore = async (userId, score) => {
  await db.query('UPDATE users SET skill_score = $1 WHERE id = $2', [score, userId]);
};

module.exports = { createUser, findUserByEmail, findUserById, updateUserSkillScore };