const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../models/User');
const { protect, authorize } = require('../../middleware/auth');
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

const createTestApp = () => {
  const app = express();
  app.use(express.json());

  app.get('/protected', protect, (req, res) => {
    res.json({ success: true, userId: req.user._id });
  });

  app.get('/admin-only', protect, authorize('admin'), (req, res) => {
    res.json({ success: true, role: req.user.role });
  });

  return app;
};

describe('Auth Middleware', () => {
  describe('protect', () => {
    it('should reject requests without token', async () => {
      const app = createTestApp();
      const res = await request(app).get('/protected');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Not authorized to access this route');
    });

    it('should reject requests with invalid token', async () => {
      const app = createTestApp();
      const res = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should allow requests with valid token', async () => {
      const user = await User.create({
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
      });
      const token = user.getSignedJwtToken();
      const app = createTestApp();

      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject token for deleted user', async () => {
      const user = await User.create({
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
      });
      const token = user.getSignedJwtToken();
      await User.deleteOne({ _id: user._id });

      const app = createTestApp();
      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('User no longer exists');
    });
  });

  describe('authorize', () => {
    it('should allow admin to access admin-only route', async () => {
      const user = await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      });
      const token = user.getSignedJwtToken();
      const app = createTestApp();

      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.role).toBe('admin');
    });

    it('should reject regular user from admin-only route', async () => {
      const user = await User.create({
        name: 'User',
        email: 'user@example.com',
        password: 'password123',
        role: 'user',
      });
      const token = user.getSignedJwtToken();
      const app = createTestApp();

      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('User role is not authorized to access this route');
    });
  });
});
