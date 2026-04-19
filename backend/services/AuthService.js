const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { ErrorFactory } = require('../utils/factory');
const Logger = require('../utils/logger');

class AuthService {
  #userRepository;
  #logger;
  constructor(userRepository) {
    this.#userRepository = userRepository;
    this.#logger = new Logger('AuthService');
  }

  async register(username, email, password) {
    this.#logger.info(`Registration attempt for email: ${email}`);

    const existingEmail = await this.#userRepository.findByEmail(email);
    if (existingEmail) {
      throw ErrorFactory.conflict('Email is already registered');
    }

    const existingUsername = await this.#userRepository.findByUsername(username);
    if (existingUsername) {
      throw ErrorFactory.conflict('Username is already taken');
    }

    const user = await this.#userRepository.create({
      username,
      email,
      passwordHash: password,
    });

    // Step 4: Generate token
    const token = this.#generateToken(user);

    this.#logger.info(`User registered successfully: ${user.email}`);

    return { user: user.toJSON(), token };
  }

  async login(email, password) {
    this.#logger.info(`Login attempt for email: ${email}`);

    const user = await this.#userRepository.findByEmail(email);
    if (!user) {
      throw ErrorFactory.unauthorized('Invalid email or password');
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw ErrorFactory.unauthorized('Invalid email or password');
    }

    const token = this.#generateToken(user);

    this.#logger.info(`User logged in successfully: ${user.email}`);

    return { user: user.toJSON(), token };
  }

  async getProfile(userId) {
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      throw ErrorFactory.notFound('User not found');
    }
    return user.toJSON();
  }

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
