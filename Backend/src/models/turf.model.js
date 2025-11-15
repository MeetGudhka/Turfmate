const db = require('../config/db');

const createTurf = async (name, address, ownerId, price, description, imageUrl) => {
  const res = await db.query(
    `INSERT INTO turfs (name, address, owner_id, price_per_hour, description, image_url)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, address, ownerId, price, description, imageUrl]
  );
  return res.rows[0];
};

const getTurfs = async (filters = {}) => {
  let query = 'SELECT * FROM turfs WHERE is_active = true';
  const values = [];
  let index = 1;

  if (filters.ownerId) {
    query += ` AND owner_id = $${index++}`;
    values.push(filters.ownerId);
  }

  const res = await db.query(query, values);
  return res.rows;
};

const getTurfById = async (id) => {
  const res = await db.query('SELECT * FROM turfs WHERE id = $1', [id]);
  return res.rows[0] || null;
};

module.exports = { createTurf, getTurfs, getTurfById };