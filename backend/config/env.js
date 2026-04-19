const dotenv = require('dotenv');

dotenv.config();

const config = {
  // Server settings
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB connection string
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/mockmate_ai',

  // JWT settings for authentication
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // CORS - which frontend URL is allowed to call our API
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

module.exports = config;
