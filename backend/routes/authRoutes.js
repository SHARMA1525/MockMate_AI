const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

const registerSchema = {
  username: { type: 'string', required: true, minLength: 3 },
  email: { type: 'string', required: true },
  password: { type: 'string', required: true, minLength: 6 },
};

const loginSchema = {
  email: { type: 'string', required: true },
  password: { type: 'string', required: true },
};

const createAuthRoutes = (authController) => {
  const router = express.Router();

  router.post('/register', validate(registerSchema), authController.register);
  router.post('/login', validate(loginSchema), authController.login);

  router.get('/me', authMiddleware, authController.getProfile);

  return router;
};

module.exports = createAuthRoutes;
