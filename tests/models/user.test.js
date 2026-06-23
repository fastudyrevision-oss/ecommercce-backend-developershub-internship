const mongoose = require('mongoose');
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

describe('User Model', () => {
  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  describe('Schema Validation', () => {
    it('should create a user with valid fields', async () => {
      const user = await User.create(validUser);
      expect(user._id).toBeDefined();
      expect(user.name).toBe(validUser.name);
      expect(user.email).toBe(validUser.email);
      expect(user.role).toBe('user');
    });

    it('should fail without a name', async () => {
      await expect(
        User.create({ email: 'test@example.com', password: 'password123' })
      ).rejects.toThrow();
    });

    it('should fail without an email', async () => {
      await expect(
        User.create({ name: 'Test', password: 'password123' })
      ).rejects.toThrow();
    });

    it('should fail with an invalid email', async () => {
      await expect(
        User.create({ name: 'Test', email: 'notanemail', password: 'password123' })
      ).rejects.toThrow();
    });

    it('should fail without a password', async () => {
      await expect(
        User.create({ name: 'Test', email: 'test@example.com' })
      ).rejects.toThrow();
    });

    it('should fail with a password shorter than 6 characters', async () => {
      await expect(
        User.create({ name: 'Test', email: 'test@example.com', password: '12345' })
      ).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      await User.create(validUser);
      await expect(User.create(validUser)).rejects.toThrow();
    });

    it('should default role to user', async () => {
      const user = await User.create(validUser);
      expect(user.role).toBe('user');
    });

    it('should accept admin role', async () => {
      const user = await User.create({ ...validUser, role: 'admin' });
      expect(user.role).toBe('admin');
    });

    it('should reject invalid role', async () => {
      await expect(
        User.create({ ...validUser, role: 'superadmin' })
      ).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash the password before saving', async () => {
      const user = await User.create(validUser);
      const savedUser = await User.findById(user._id).select('+password');
      expect(savedUser.password).not.toBe(validUser.password);
      expect(savedUser.password.length).toBeGreaterThan(20);
    });

    it('should not re-hash password if not modified', async () => {
      const user = await User.create(validUser);
      const savedUser = await User.findById(user._id).select('+password');
      const originalHash = savedUser.password;
      savedUser.name = 'Updated Name';
      await savedUser.save();
      const updatedUser = await User.findById(user._id).select('+password');
      expect(updatedUser.password).toBe(originalHash);
    });
  });

  describe('getSignedJwtToken', () => {
    it('should return a JWT token', async () => {
      const user = await User.create(validUser);
      const token = user.getSignedJwtToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('matchPassword', () => {
    it('should return true for correct password', async () => {
      const user = await User.create(validUser);
      const savedUser = await User.findById(user._id).select('+password');
      const isMatch = await savedUser.matchPassword('password123');
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create(validUser);
      const savedUser = await User.findById(user._id).select('+password');
      const isMatch = await savedUser.matchPassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });
});
