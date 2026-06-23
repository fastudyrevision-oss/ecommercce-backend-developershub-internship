const mongoose = require('mongoose');
const Inquiry = require('../../models/Inquiry');
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

describe('Inquiry Model', () => {
  const validInquiry = {
    item: 'Test Item',
    quantity: 5,
    unit: 'Pcs',
    message: 'I need this urgently',
    email: 'buyer@example.com',
  };

  describe('Schema Validation', () => {
    it('should create an inquiry with valid fields', async () => {
      const inquiry = await Inquiry.create(validInquiry);
      expect(inquiry._id).toBeDefined();
      expect(inquiry.item).toBe(validInquiry.item);
      expect(inquiry.quantity).toBe(validInquiry.quantity);
      expect(inquiry.unit).toBe(validInquiry.unit);
      expect(inquiry.message).toBe(validInquiry.message);
      expect(inquiry.email).toBe(validInquiry.email);
    });

    it('should fail without an item', async () => {
      const { item, ...noItem } = validInquiry;
      await expect(Inquiry.create(noItem)).rejects.toThrow();
    });

    it('should fail without a quantity', async () => {
      const { quantity, ...noQuantity } = validInquiry;
      await expect(Inquiry.create(noQuantity)).rejects.toThrow();
    });

    it('should fail without a unit', async () => {
      const { unit, ...noUnit } = validInquiry;
      await expect(Inquiry.create(noUnit)).rejects.toThrow();
    });

    it('should fail without an email', async () => {
      const { email, ...noEmail } = validInquiry;
      await expect(Inquiry.create(noEmail)).rejects.toThrow();
    });

    it('should create inquiry without a message (optional)', async () => {
      const { message, ...noMessage } = validInquiry;
      const inquiry = await Inquiry.create(noMessage);
      expect(inquiry._id).toBeDefined();
      expect(inquiry.message).toBeUndefined();
    });

    it('should set createdAt by default', async () => {
      const inquiry = await Inquiry.create(validInquiry);
      expect(inquiry.createdAt).toBeDefined();
      expect(inquiry.createdAt).toBeInstanceOf(Date);
    });
  });
});
