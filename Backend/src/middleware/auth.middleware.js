const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = userRes.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };