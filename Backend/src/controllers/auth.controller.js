const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');
const { validate } = require('../middleware/validate.middleware');
const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('user', 'owner').default('user'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  const user = await authService.register(name, email, password, phone, role);
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  const { accessToken } = await authService.refreshTokens(refreshToken);
  res.json({ accessToken });
});

const logout = asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    // In real app: blacklist token or delete from DB
    await req.db.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  }
  res.sendStatus(204);
});

module.exports = { register, login, refresh, logout };