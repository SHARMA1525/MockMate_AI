/**
 * Database Connection - Singleton Pattern
 * 
 * This class ensures only ONE database connection exists
 * throughout the entire application lifecycle.
 * 
 * WHY SINGLETON?
 * - MongoDB connections are expensive to create
 * - Multiple connections can exhaust database resources
 * - We want a single, shared connection pool
 * 
 * DESIGN PATTERN: Singleton
 * - Private static instance stored in the class
 * - getInstance() always returns the same instance
 */

const mongoose = require('mongoose');
const config = require('./env');
const Logger = require('../utils/logger');

class Database {
  // Static variable to hold the single instance
  static #instance = null;

  constructor() {
    // Prevent direct construction — must use getInstance()
    if (Database.#instance) {
      throw new Error('Database already initialized. Use Database.getInstance()');
    }

    this.connection = null;
    this.logger = new Logger('Database');
  }

  /**
   * Singleton accessor — always returns the same Database instance.
   * Creates a new one only on the first call.
   */
  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  /**
   * Connect to MongoDB using Mongoose.
   * Sets up event listeners for connection lifecycle events.
   */
  async connect() {
    try {
      // If already connected, skip
      if (this.connection) {
        this.logger.info('Already connected to MongoDB');
        return this.connection;
      }

      this.logger.info('Connecting to MongoDB...');

      // Connect with recommended options
      this.connection = await mongoose.connect(config.mongoUri);

      this.logger.info(`MongoDB connected: ${this.connection.connection.host}`);

      // Handle connection events for monitoring
      mongoose.connection.on('error', (err) => {
        this.logger.error(`MongoDB connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        this.logger.warn('MongoDB disconnected');
      });

      return this.connection;
    } catch (error) {
      this.logger.error(`Failed to connect to MongoDB: ${error.message}`);
      // Exit the process if DB connection fails — app can't work without it
      process.exit(1);
    }
  }

  /**
   * Gracefully close the database connection.
   * Called when the server shuts down.
   */
  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
      this.connection = null;
      this.logger.info('MongoDB connection closed');
    }
  }
}

module.exports = Database;
