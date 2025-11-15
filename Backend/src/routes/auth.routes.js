// src/routes/auth.routes.js
const express = require('express');
const { register, login, refresh, logout } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate.middleware');
const Joi = require('joi');

const router = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(100).required(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  role: Joi.string().valid('user', 'owner').default('user'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', logout);

module.exports = router;