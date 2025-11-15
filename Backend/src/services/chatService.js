const db = require('../config/db');

const saveMessage = async (roomId, userId, message) => {
  await db.query(
    'INSERT INTO chat_messages (room_id, user_id, message) VALUES ($1, $2, $3)',
    [roomId, userId, message]
  );
};

const getMessages = async (roomId) => {
  const res = await db.query(
    'SELECT * FROM chat_messages WHERE room_id = $1 ORDER BY created_at ASC',
    [roomId]
  );
  return res.rows;
};

module.exports = { saveMessage, getMessages };