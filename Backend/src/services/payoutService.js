const db = require('../config/db');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createPayout = async (turfOwnerId, amount) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Get turf owner's bank details
        const ownerDetails = await client.query(
            `SELECT bank_account_id, bank_account_name, 
                    bank_ifsc, bank_account_number 
             FROM turf_owners 
             WHERE user_id = $1`,
            [turfOwnerId]
        );

        if (!ownerDetails.rows[0]?.bank_account_id) {
            throw new Error('Bank account details not found');
        }

        // Create payout using Razorpay
        const payout = await razorpay.payouts.create({
            account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
            fund_account_id: ownerDetails.rows[0].bank_account_id,
            amount: amount * 100, // Convert to paise
            currency: "INR",
            mode: "IMPS",
            purpose: "payout",
            queue_if_low_balance: true
        });

        // Record transaction in database
        await client.query(
            `INSERT INTO transactions 
             (user_id, type, amount, status, payout_id, reference_id)
             VALUES ($1, 'payout', $2, $3, $4, $5)`,
            [turfOwnerId, amount, payout.status, payout.id, payout.reference_id]
        );

        await client.query('COMMIT');
        return payout;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const processPendingPayouts = async () => {
    const pendingBookings = await db.query(
        `SELECT b.*, t.owner_id, t.commission_rate
         FROM bookings b
         JOIN turfs t ON b.turf_id = t.id
         WHERE b.payout_status = 'pending'
         AND b.status = 'completed'`
    );

    for (const booking of pendingBookings.rows) {
        try {
            const commissionAmount = (booking.amount * booking.commission_rate) / 100;
            const payoutAmount = booking.amount - commissionAmount;

            await createPayout(booking.owner_id, payoutAmount);

            await db.query(
                'UPDATE bookings SET payout_status = $1 WHERE id = $2',
                ['completed', booking.id]
            );
        } catch (err) {
            console.error(`Payout failed for booking ${booking.id}:`, err);
        }
    }
};

const getTurfOwnerPayouts = async (ownerId) => {
    const result = await db.query(
        `SELECT t.*, b.booking_id 
         FROM transactions t
         LEFT JOIN bookings b ON t.reference_id = b.payout_reference_id
         WHERE t.user_id = $1 AND t.type = 'payout'
         ORDER BY t.created_at DESC`,
        [ownerId]
    );
    return result.rows;
};

module.exports = {
    createPayout,
    processPendingPayouts,
    getTurfOwnerPayouts
};