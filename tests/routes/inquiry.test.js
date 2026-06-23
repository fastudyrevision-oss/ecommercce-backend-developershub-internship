const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Inquiry = require('../../models/Inquiry');
const User = require('../../models/User');
const db = require('../setup');

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret123';
  await db.connect();
});

afterEach(async () => {
  await db.clearDatabase();
});

afterAll(async () => {
  await db.closeDatabase();
});

const getAdminToken = async () => {
  const user = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  });
  return user.getSignedJwtToken();
};

describe('Inquiry Routes', () => {
  const validInquiry = {
    item: 'Laptop',
    quantity: 10,
    unit: 'Pcs',
    message: 'Need bulk order',
    email: 'buyer@example.com',
  };

  describe('POST /api/inquiries', () => {
    it('should create a new inquiry', async () => {
      const res = await request(app)
        .post('/api/inquiries')
        .send(validInquiry);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item).toBe(validInquiry.item);
      expect(res.body.data.quantity).toBe(validInquiry.quantity);
      expect(res.body.data.unit).toBe(validInquiry.unit);
      expect(res.body.data.email).toBe(validInquiry.email);
    });

    it('should create inquiry without optional message', async () => {
      const { message, ...noMessage } = validInquiry;
      const res = await request(app)
        .post('/api/inquiries')
        .send(noMessage);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail without item', async () => {
      const { item, ...noItem } = validInquiry;
      const res = await request(app)
        .post('/api/inquiries')
        .send(noItem);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail without quantity', async () => {
      const { quantity, ...noQuantity } = validInquiry;
      const res = await request(app)
        .post('/api/inquiries')
        .send(noQuantity);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail without unit', async () => {
      const { unit, ...noUnit } = validInquiry;
      const res = await request(app)
        .post('/api/inquiries')
        .send(noUnit);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail without email', async () => {
      const { email, ...noEmail } = validInquiry;
      const res = await request(app)
        .post('/api/inquiries')
        .send(noEmail);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/inquiries', () => {
    it('should fail without authentication', async () => {
      const res = await request(app).get('/api/inquiries');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail for non-admin user', async () => {
      const user = await User.create({
        name: 'Regular',
        email: 'user@example.com',
        password: 'password123',
        role: 'user',
      });
      const token = user.getSignedJwtToken();

      const res = await request(app)
        .get('/api/inquiries')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return all inquiries for admin', async () => {
      const token = await getAdminToken();
      await Inquiry.create(validInquiry);
      await Inquiry.create({ ...validInquiry, item: 'Phone' });

      const res = await request(app)
        .get('/api/inquiries')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('should return inquiries sorted by newest first', async () => {
      const token = await getAdminToken();
      await Inquiry.create({ ...validInquiry, item: 'First' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await Inquiry.create({ ...validInquiry, item: 'Second' });

      const res = await request(app)
        .get('/api/inquiries')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].item).toBe('Second');
      expect(res.body.data[1].item).toBe('First');
    });
  });
});
