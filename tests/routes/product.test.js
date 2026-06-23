const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Product = require('../../models/Product');
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

describe('Product Routes', () => {
  const validProduct = {
    name: 'Test Product',
    price: 29.99,
    category: 'Electronics',
    description: 'A test product description',
    stock: 10,
  };

  describe('GET /api/products', () => {
    it('should return empty array when no products exist', async () => {
      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('should return all products', async () => {
      await Product.create(validProduct);
      await Product.create({ ...validProduct, name: 'Product 2' });

      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
    });

    it('should support pagination with page and limit', async () => {
      for (let i = 0; i < 15; i++) {
        await Product.create({ ...validProduct, name: `Product ${i}` });
      }

      const res = await request(app).get('/api/products?page=2&limit=5');

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(5);
      expect(res.body.pagination.prev).toBeDefined();
      expect(res.body.pagination.prev.page).toBe(1);
    });

    it('should filter by category', async () => {
      await Product.create(validProduct);
      await Product.create({ ...validProduct, name: 'Furniture', category: 'Home' });

      const res = await request(app).get('/api/products?category=Electronics');

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].category).toBe('Electronics');
    });

    it('should show next pagination when more results exist', async () => {
      for (let i = 0; i < 12; i++) {
        await Product.create({ ...validProduct, name: `Product ${i}` });
      }

      const res = await request(app).get('/api/products?page=1&limit=10');

      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.next).toBeDefined();
      expect(res.body.pagination.next.page).toBe(2);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product by id', async () => {
      const product = await Product.create(validProduct);

      const res = await request(app).get(`/api/products/${product._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(validProduct.name);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/products/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Product not found');
    });

    it('should return 404 for invalid id format (CastError)', async () => {
      const res = await request(app).get('/api/products/invalidid');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Resource not found');
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product when authenticated as admin', async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(validProduct);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(validProduct.name);
      expect(res.body.data.price).toBe(validProduct.price);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/products')
        .send(validProduct);

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
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(validProduct);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should fail without required fields', async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Incomplete' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
