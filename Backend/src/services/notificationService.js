const db = require('../config/db');

const getUserNotifications = async (userId) => {
  const res = await db.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return res.rows;
};

// In real app: sendEmail, sendPush, etc.

module.exports = { getUserNotifications };