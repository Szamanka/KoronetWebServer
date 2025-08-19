const request = require('supertest');
const app = require('./index');

describe('API Endpoints', () => {
  test('GET / should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Hi Koronet Team.');
  });

  test('GET /health should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBeIn([200, 503]);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('services');
  });

  test('GET /ready should return readiness status', async () => {
    const res = await request(app).get('/ready');
    expect(res.statusCode).toBeIn([200, 503]);
    expect(res.body).toHaveProperty('ready');
  });
});