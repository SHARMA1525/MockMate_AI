const mongoose = require('mongoose');
const config = require('./env');
const Logger = require('../utils/logger');

class Database {
  static #instance = null;

  constructor() {
    if (Database.#instance) {
      throw new Error('Database already initialized. Use Database.getInstance()');
    }

    this.connection = null;
    this.logger = new Logger('Database');
  }
  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  async connect() {
    try {
      if (this.connection) {
        this.logger.info('Already connected to MongoDB');
        return this.connection;
      }

      this.logger.info('Connecting to MongoDB...');

      this.connection = await mongoose.connect(config.mongoUri);

      this.logger.info(`MongoDB connected: ${this.connection.connection.host}`);

      mongoose.connection.on('error', (err) => {
        this.logger.error(`MongoDB connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        this.logger.warn('MongoDB disconnected');
      });

      return this.connection;
    } catch (error) {
      this.logger.error(`Failed to connect to MongoDB: ${error.message}`);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
      this.connection = null;
      this.logger.info('MongoDB connection closed');
    }
  }
}

module.exports = Database;
