/**
 * Auth Service
 * 
 * DESIGN PATTERN: Service Layer
 * OOP CONCEPT: Encapsulation (private #userRepository field)
 * 
 * Contains all authentication business logic:
 * - Registration with duplicate checking
 * - Login with credential verification
 * - JWT token generation
 * 
 * The controller calls these methods — it never touches
 * the database directly. This separation keeps our code
 * organized and testable.
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { ErrorFactory } = require('../utils/factory');
const Logger = require('../utils/logger');

class AuthService {
  // ENCAPSULATION: #userRepository is private — only this class can access it
  #userRepository;
  #logger;

  /**
   * DEPENDENCY INJECTION:
   * The repository is passed in through the constructor,
   * not created inside the class. This makes testing easier
   * because we can pass in a mock repository.
   */
  constructor(userRepository) {
    this.#userRepository = userRepository;
    this.#logger = new Logger('AuthService');
  }

  /**
   * Register a new user
   * 
   * Steps:
   * 1. Check if email already exists
   * 2. Check if username already exists
   * 3. Create user (password is auto-hashed by the User model)
   * 4. Generate JWT token
   * 5. Return user data + token
   */
  async register(username, email, password) {
    this.#logger.info(`Registration attempt for email: ${email}`);

    // Step 1: Check for duplicate email
    const existingEmail = await this.#userRepository.findByEmail(email);
    if (existingEmail) {
      throw ErrorFactory.conflict('Email is already registered');
    }

    // Step 2: Check for duplicate username
    const existingUsername = await this.#userRepository.findByUsername(username);
    if (existingUsername) {
      throw ErrorFactory.conflict('Username is already taken');
    }

    // Step 3: Create the user
    // Note: passwordHash field name is used because the model hashes it via pre-save hook
    const user = await this.#userRepository.create({
      username,
      email,
      passwordHash: password,  // Will be hashed by the pre-save hook
    });

    // Step 4: Generate token
    const token = this.#generateToken(user);

    this.#logger.info(`User registered successfully: ${user.email}`);

    // Step 5: Return user (password is auto-removed by toJSON transform)
    return { user: user.toJSON(), token };
  }

  /**
   * Login an existing user
   * 
   * Steps:
   * 1. Find user by email
   * 2. Compare password with stored hash
   * 3. Generate JWT token
   * 4. Return user data + token
   */
  async login(email, password) {
    this.#logger.info(`Login attempt for email: ${email}`);

    // Step 1: Find user
    const user = await this.#userRepository.findByEmail(email);
    if (!user) {
      throw ErrorFactory.unauthorized('Invalid email or password');
    }

    // Step 2: Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw ErrorFactory.unauthorized('Invalid email or password');
    }

    // Step 3: Generate token
    const token = this.#generateToken(user);

    this.#logger.info(`User logged in successfully: ${user.email}`);

    // Step 4: Return data
    return { user: user.toJSON(), token };
  }

  /**
   * Get the current user's profile by ID
   */
  async getProfile(userId) {
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      throw ErrorFactory.notFound('User not found');
    }
    return user.toJSON();
  }

  /**
   * Generate a JWT token containing user ID and role
   * 
   * PRIVATE METHOD — only used internally by this class.
   * The token payload includes the user's ID and role so that
   * the auth middleware can identify and authorize users.
   */
  #generateToken(user) {
    const payload = {
      id: user._id,
      role: user.role,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
  }
}

module.exports = AuthService;
