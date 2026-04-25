const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./test_server');
const Admin = require('../models/Admin');

describe('Auth API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return 401 for invalid credentials', async () => {
    const res = await request(app).post('/api/login').send({ username: 'testuser', password: 'wrongpassword' });
    expect(res.statusCode).toEqual(401);
  });
});
