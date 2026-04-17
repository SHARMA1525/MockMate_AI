/**
 * Admin Routes
 * 
 * All routes here require authentication AND admin role.
 * Used for user management and analytics.
 */

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

/**
 * Create admin router with injected controller
 * @param {AdminController} adminController - Injected controller instance
 * @returns {express.Router} Configured router
 */
const createAdminRoutes = (adminController) => {
  const router = express.Router();

  // All admin routes require authentication + admin role
  router.use(authMiddleware);
  router.use(roleMiddleware(ROLES.ADMIN));

  // List all users
  router.get('/users', adminController.getAllUsers);

  // Get aggregated analytics
  router.get('/reports', adminController.getAnalytics);

  return router;
};

module.exports = createAdminRoutes;
