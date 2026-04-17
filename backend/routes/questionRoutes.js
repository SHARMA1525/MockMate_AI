/**
 * Question Routes
 * 
 * Read routes are available to authenticated users.
 * Write routes (create, update, delete) are admin-only.
 */

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

/**
 * Create question router with injected controller
 * @param {QuestionController} questionController - Injected controller instance
 * @returns {express.Router} Configured router
 */
const createQuestionRoutes = (questionController) => {
  const router = express.Router();

  // All question routes require authentication
  router.use(authMiddleware);

  // Read routes — available to all authenticated users
  router.get('/', questionController.getAll);
  router.get('/categories', questionController.getCategories);
  router.get('/:id', questionController.getById);

  // Write routes — admin only
  router.post('/', roleMiddleware(ROLES.ADMIN), questionController.create);
  router.put('/:id', roleMiddleware(ROLES.ADMIN), questionController.update);
  router.delete('/:id', roleMiddleware(ROLES.ADMIN), questionController.delete);

  return router;
};

module.exports = createQuestionRoutes;
