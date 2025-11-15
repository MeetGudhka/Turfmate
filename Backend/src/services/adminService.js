const db = require('../config/db');

const getAnalytics = async () => {
  const bookings = await db.query('SELECT COUNT(*) FROM bookings WHERE status = $1', ['confirmed']);
  const revenue = await db.query('SELECT SUM(amount) FROM bookings WHERE status = $1', ['confirmed']);
  const turfs = await db.query('SELECT COUNT(*) FROM turfs');
  const users = await db.query('SELECT COUNT(*) FROM users WHERE role = $1', ['user']);

  return {
    totalBookings: parseInt(bookings.rows[0].count),
    totalRevenue: parseFloat(revenue.rows[0].sum) || 0,
    totalTurfs: parseInt(turfs.rows[0].count),
    totalUsers: parseInt(users.rows[0].count),
  };
};

module.exports = { getAnalytics };