const db = require('../config/db');

const createSlotsForTurf = async (turfId, start, end) => {
  // Not used; slots are pre-generated in seed
};

const findAvailableSlot = async (turfId, startTime, endTime) => {
  const res = await db.query(
    `SELECT * FROM slots 
     WHERE turf_id = $1 AND start_time = $2 AND end_time = $3 AND is_booked = false
     FOR UPDATE`,
    [turfId, startTime, endTime]
  );
  return res.rows[0];
};

const lockSlot = async (slotId) => {
  await db.query('UPDATE slots SET is_booked = true WHERE id = $1', [slotId]);
};

module.exports = { findAvailableSlot, lockSlot };