/**
 * Auth Service Tests
 * 
 * Unit tests for the AuthService class.
 * Tests registration, login, and error handling.
 * 
 * Note: These tests mock the UserRepository to isolate
 * the service logic from the database.
 */

const AuthService = require('../services/AuthService');

// --- Mock User Repository ---
// We create a fake repository that behaves like the real one
// but doesn't need a database connection.
class MockUserRepository {
  constructor() {
    this.users = [];
  }

  async findByEmail(email) {
    return this.users.find(u => u.email === email.toLowerCase()) || null;
  }

  async findByUsername(username) {
    return this.users.find(u => u.username === username) || null;
  }

  async create(userData) {
    const user = {
      _id: 'mock_id_' + Date.now(),
      ...userData,
      // Simulate the toJSON transform (remove password)
      toJSON() {
        const { passwordHash, ...rest } = this;
        return rest;
      },
      // Simulate the comparePassword method
      comparePassword: async (pw) => pw === userData.passwordHash,
    };
    this.users.push(user);
    return user;
  }

  async findById(id) {
    const user = this.users.find(u => u._id === id);
    if (user) {
      return {
        ...user,
        toJSON() {
          const { passwordHash, ...rest } = this;
          return rest;
        },
      };
    }
    return null;
  }
}

describe('AuthService', () => {
  let authService;
  let mockRepo;

  beforeEach(() => {
    mockRepo = new MockUserRepository();
    authService = new AuthService(mockRepo);
  });

  describe('register()', () => {
    test('should register a new user successfully', async () => {
      const result = await authService.register('testuser', 'test@example.com', 'password123');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.username).toBe('testuser');
      // Password should NOT be in the response
      expect(result.user.passwordHash).toBeUndefined();
    });

    test('should throw error if email already exists', async () => {
      // Register first user
      await authService.register('user1', 'test@example.com', 'password123');

      // Try to register with same email
      await expect(
        authService.register('user2', 'test@example.com', 'password456')
      ).rejects.toThrow('Email is already registered');
    });

    test('should throw error if username already exists', async () => {
      await authService.register('testuser', 'test1@example.com', 'password123');

      await expect(
        authService.register('testuser', 'test2@example.com', 'password456')
      ).rejects.toThrow('Username is already taken');
    });
  });

  describe('login()', () => {
    test('should login successfully with correct credentials', async () => {
      await authService.register('testuser', 'test@example.com', 'password123');

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');
    });

    test('should throw error with wrong email', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid email or password');
    });

    test('should throw error with wrong password', async () => {
      await authService.register('testuser', 'test@example.com', 'password123');

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
