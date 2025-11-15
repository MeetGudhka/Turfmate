const request = require('supertest');
const app = require('../index');
const db = require('../config/db');

describe('Chat', () => {
  let token;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'password' });
    token = loginRes.body.accessToken;
  });

  it('should get messages for room', async () => {
    const res = await request(app)
      .get('/api/chat/room/test-room')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});