const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./test_server');
const Message = require('../models/Message');

describe('Messages API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });
  afterAll(async () => {
    await Message.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create a new message', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        whatsappnumber: '1234567890',
        content: 'Hello, this is a test message.'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Message sent!');
  });

  it('should fail if email is missing', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'John Doe',
        whatsappnumber: '1234567890',
        content: 'Hello, this is a test message.'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Email is required');
  });
});
