const request = require('supertest');
const app = require('../index');
const db = require('../config/db');

describe('Booking Flow', () => {
  let server;
  let authToken;

  beforeAll(async () => {
    server = app.listen(5001);
    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'password' });
    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await server.close();
    await db.end();
  });

  it('should create a booking with slot lock', async () => {
    // Get available slot
    const slotRes = await request(app)
      .get('/api/turfs')
      .set('Authorization', `Bearer ${authToken}`);
    const turfId = slotRes.body[0].id;

    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        turfId,
        startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        endTime: new Date(Date.now() + 86400000 + 3600000).toISOString()
      });

    expect(bookingRes.statusCode).toBe(201);
    expect(bookingRes.body).toHaveProperty('id');
  });
});