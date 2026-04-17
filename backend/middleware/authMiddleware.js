/**
 * Authentication Middleware
 * 
 * DESIGN PATTERN: Middleware Pattern
 * 
 * This middleware intercepts every request to protected routes.
 * It checks for a valid JWT token in the Authorization header.
 * If valid, it attaches the decoded user data to req.user.
 * If invalid, it rejects the request with 401 Unauthorized.
 * 
 * HOW IT WORKS:
 * 1. Client sends: Authorization: Bearer <token>
 * 2. Middleware extracts the token
 * 3. Verifies it with jwt.verify()
 * 4. Attaches decoded payload (id, role) to req.user
 * 5. Calls next() to continue to the route handler
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { ErrorFactory } = require('../utils/factory');

const authMiddleware = (req, res, next) => {
  try {
    // Get the Authorization header
    const authHeader = req.headers.authorization;

    // Check if header exists and has the right format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ErrorFactory.unauthorized('No token provided. Please log in.');
    }

    // Extract the token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    // Verify the token and decode its payload
    const decoded = jwt.verify(token, config.jwtSecret);

    // Attach user info to the request object
    // Now any route handler can access req.user.id and req.user.role
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // Handle specific JWT errors with friendly messages
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
