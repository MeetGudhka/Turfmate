const request = require('supertest');
const app = require('../index');

describe('Payment Webhook', () => {
  it('should accept valid webhook', async () => {
    const res = await request(app)
      .post('/api/payments/webhook')
      .send({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_test', status: 'captured', notes: { bookingId: '123' } } } } });
    expect(res.statusCode).toBe(200);
  });
});