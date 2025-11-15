const db = require('../config/db');

const isOwnerOfTurf = async (req, res, next) => {
  const { turfId } = req.params;
  if (!turfId) {
    return res.status(400).json({ error: 'turfId required' });
  }

  try {
    const result = await db.query(
      `SELECT owner_id FROM turfs WHERE id = $1`,
      [turfId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Turf not found' });
    }
    if (result.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not owner of this turf' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { isOwnerOfTurf };