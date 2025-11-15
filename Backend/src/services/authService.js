const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { generateToken } = require('../utils/jwt.utils');
const { findUserByEmail, createUser } = require('../models/user.model');
const bcrypt = require('bcrypt');

const register = async (name, email, password, phone, role = 'user') => {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error('Email already in use');

  const user = await createUser(name, email, password, phone, role);
  return user;
};

const login = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Invalid credentials');

  const accessToken = generateToken({ userId: user.id }, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);
  const refreshToken = generateToken({ userId: user.id }, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES_IN);

  // Store refresh token in DB (simplified: in real app, store hashed)
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) 
     VALUES ($1, $2, NOW() + INTERVAL '7 days')
     ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = NOW() + INTERVAL '7 days'`,
    [user.id, refreshToken]
  );

  return { user, accessToken, refreshToken };
};

const refreshTokens = async (refreshToken) => {
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new Error('Invalid refresh token');
  }

  const tokenRecord = await db.query(
    'SELECT * FROM refresh_tokens WHERE user_id = $1 AND token = $2',
    [payload.userId, refreshToken]
  );

  if (tokenRecord.rows.length === 0) {
    throw new Error('Refresh token not found');
  }

  const user = await db.query('SELECT * FROM users WHERE id = $1', [payload.userId]);
  if (!user.rows[0]) throw new Error('User not found');

  const newAccessToken = generateToken({ userId: user.rows[0].id }, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);
  return { accessToken: newAccessToken };
};

module.exports = { register, login, refreshTokens };