/**
 * Auth Routes
 * 
 * Maps HTTP endpoints to AuthController methods.
 * Uses validation middleware to check request bodies.
 * 
 * PUBLIC routes (no auth needed):
 *   POST /api/auth/register
 *   POST /api/auth/login
 * 
 * PROTECTED routes (auth required):
 *   GET /api/auth/me
 */

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

// Validation schemas
const registerSchema = {
  username: { type: 'string', required: true, minLength: 3 },
  email: { type: 'string', required: true },
  password: { type: 'string', required: true, minLength: 6 },
};

const loginSchema = {
  email: { type: 'string', required: true },
  password: { type: 'string', required: true },
};

/**
 * Create auth router with injected controller
 * @param {AuthController} authController - Injected controller instance
 * @returns {express.Router} Configured router
 */
const createAuthRoutes = (authController) => {
  const router = express.Router();

  // Public routes
  router.post('/register', validate(registerSchema), authController.register);
  router.post('/login', validate(loginSchema), authController.login);

  // Protected routes
  router.get('/me', authMiddleware, authController.getProfile);

  return router;
};

module.exports = createAuthRoutes;
