const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { ErrorFactory } = require('../utils/factory');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ErrorFactory.unauthorized('No token provided. Please log in.');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(ErrorFactory.unauthorized('Invalid token. Please log in again.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ErrorFactory.unauthorized('Token expired. Please log in again.'));
    }
    next(error);
  }
};

module.exports = authMiddleware;
