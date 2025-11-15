const db = require('../config/db');
const turfModel = require('../models/turf.model');
const slotModel = require('../models/slot.model');
const bookingModel = require('../models/booking.model');

const createBooking = async (userId, turfId, startTime, endTime) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const turf = await turfModel.getTurfById(turfId);
    if (!turf) throw new Error('Turf not found');

    const slot = await slotModel.findAvailableSlot(turfId, startTime, endTime);
    if (!slot) throw new Error('Slot not available');

    await slotModel.lockSlot(slot.id);

    const amount = turf.price_per_hour;
    const booking = await bookingModel.createBooking(userId, slot.id, turfId, amount);

    await client.query('COMMIT');
    return booking;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getUserBookings = async (userId) => {
  const res = await db.query(
    `SELECT b.*, t.name as turf_name, s.start_time, s.end_time
     FROM bookings b
     JOIN turfs t ON b.turf_id = t.id
     JOIN slots s ON b.slot_id = s.id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return res.rows;
};

module.exports = { createBooking, getUserBookings };