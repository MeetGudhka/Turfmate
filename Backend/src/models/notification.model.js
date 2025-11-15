const db = require('../config/db');

const createNotification = async (userId, type, title, message) => {
  await db.query(
    `INSERT INTO notifications (user_id, type, title, message)
     VALUES ($1, $2, $3, $4)`,
    [userId, type, title, message]
  );
};

const getUserNotifications = async (userId) => {
  const res = await db.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return res.rows;
};

module.exports = { createNotification, getUserNotifications };