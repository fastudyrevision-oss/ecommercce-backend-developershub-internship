const mongoose = require('mongoose');
const Product = require('../../models/Product');
const db = require('../setup');

beforeAll(async () => {
  await db.connect();
});

afterEach(async () => {
  await db.clearDatabase();
});

afterAll(async () => {
  await db.closeDatabase();
});

describe('Product Model', () => {
  const validProduct = {
    name: 'Test Product',
    price: 29.99,
    category: 'Electronics',
    description: 'A test product description',
    stock: 10,
  };

  describe('Schema Validation', () => {
    it('should create a product with valid fields', async () => {
      const product = await Product.create(validProduct);
      expect(product._id).toBeDefined();
      expect(product.name).toBe(validProduct.name);
      expect(product.price).toBe(validProduct.price);
      expect(product.category).toBe(validProduct.category);
      expect(product.description).toBe(validProduct.description);
      expect(product.stock).toBe(validProduct.stock);
    });

    it('should fail without a name', async () => {
      const { name, ...noName } = validProduct;
      await expect(Product.create(noName)).rejects.toThrow();
    });

    it('should fail without a price', async () => {
      const { price, ...noPrice } = validProduct;
      await expect(Product.create(noPrice)).rejects.toThrow();
    });

    it('should fail without a category', async () => {
      const { category, ...noCategory } = validProduct;
      await expect(Product.create(noCategory)).rejects.toThrow();
    });

    it('should fail without a description', async () => {
      const { description, ...noDesc } = validProduct;
      await expect(Product.create(noDesc)).rejects.toThrow();
    });

    it('should set default image to no-photo.jpg', async () => {
      const product = await Product.create(validProduct);
      expect(product.image).toBe('no-photo.jpg');
    });

    it('should set default stock to 0', async () => {
      const { stock, ...noStock } = validProduct;
      const product = await Product.create(noStock);
      expect(product.stock).toBe(0);
    });

    it('should trim the name', async () => {
      const product = await Product.create({ ...validProduct, name: '  Trimmed  ' });
      expect(product.name).toBe('Trimmed');
    });

    it('should set createdAt by default', async () => {
      const product = await Product.create(validProduct);
      expect(product.createdAt).toBeDefined();
      expect(product.createdAt).toBeInstanceOf(Date);
    });
  });
});
