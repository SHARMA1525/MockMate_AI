const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

const createAdminRoutes = (adminController) => {
  const router = express.Router();
  router.use(authMiddleware);
  router.use(roleMiddleware(ROLES.ADMIN));

  router.get('/users', adminController.getAllUsers);

  router.get('/reports', adminController.getAnalytics);

  return router;
};

module.exports = createAdminRoutes;
