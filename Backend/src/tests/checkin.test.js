// src/tests/checkin.test.js
const request = require('supertest');
const app = require('../index');
const db = require('../config/db');

describe('Check-in Flow', () => {
  let server;
  let authToken;
  let bookingId;

  beforeAll(async () => {
    server = app.listen(5002);
    
    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'password' });
    authToken = loginRes.body.accessToken;

    // Create a booking first
    const turfsRes = await request(app)
      .get('/api/turfs')
      .set('Authorization', `Bearer ${authToken}`);
    const turf = turfsRes.body[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const endTime = new Date(tomorrow);
    endTime.setHours(11, 0, 0, 0);

    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        turfId: turf.id,
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString()
      });
    bookingId = bookingRes.body.id;

    // Confirm booking (simulate payment)
    await db.query(
      `UPDATE bookings SET status = 'confirmed' WHERE id = $1`,
      [bookingId]
    );
  });

  afterAll(async () => {
    await server.close();
    await db.end();
  });

  it('should generate a check-in token', async () => {
    const res = await request(app)
      .post(`/api/checkin/generate/${bookingId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.token).toHaveLength(32);
  });

  it('should verify a check-in token', async () => {
    // First, generate token
    const genRes = await request(app)
      .post(`/api/checkin/generate/${bookingId}`)
      .set('Authorization', `Bearer ${authToken}`);
    const token = genRes.body.token;

    // Then verify
    const verifyRes = await request(app)
      .post('/api/checkin/verify')
      .send({ token });

    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body.success).toBe(true);
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
      .post('/api/checkin/verify')
      .send({ token: 'invalid_token_123456789012345678901234' });
    
    expect(res.statusCode).toBe(400);
  });
});