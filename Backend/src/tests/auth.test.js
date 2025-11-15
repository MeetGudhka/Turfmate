const request = require('supertest');
const app = require('../index');

describe('Auth', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});