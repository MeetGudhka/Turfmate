const crypto = require('crypto');
const db = require('../config/db');
const { sendEmail } = require('./notificationService');

const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const createVerificationToken = async (userId, type) => {
    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.query(
        `INSERT INTO verification_tokens (user_id, token, type, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [userId, token, type, expiresAt]
    );

    return token;
};

const sendVerificationEmail = async (user) => {
    const token = await createVerificationToken(user.id, 'email_verification');
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await sendEmail(
        user.email,
        'Verify Your Email - TurfMate',
        `
        <h2>Welcome to TurfMate!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        `
    );
};

const sendPasswordResetEmail = async (user) => {
    const token = await createVerificationToken(user.id, 'password_reset');
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendEmail(
        user.email,
        'Password Reset - TurfMate',
        `
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
        `
    );
};

const verifyToken = async (token, type) => {
    const result = await db.query(
        `SELECT * FROM verification_tokens 
         WHERE token = $1 AND type = $2 AND used = false 
         AND expires_at > NOW()`,
        [token, type]
    );

    if (result.rows.length === 0) {
        throw new Error('Invalid or expired token');
    }

    await db.query(
        'UPDATE verification_tokens SET used = true WHERE token = $1',
        [token]
    );

    return result.rows[0];
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    verifyToken
};