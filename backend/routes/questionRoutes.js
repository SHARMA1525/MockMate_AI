const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

const createQuestionRoutes = (questionController) => {
  const router = express.Router();
  router.use(authMiddleware);

  router.get('/', questionController.getAll);
  router.get('/categories', questionController.getCategories);
  router.get('/:id', questionController.getById);

  router.post('/', roleMiddleware(ROLES.ADMIN), questionController.create);
  router.put('/:id', roleMiddleware(ROLES.ADMIN), questionController.update);
  router.delete('/:id', roleMiddleware(ROLES.ADMIN), questionController.delete);

  return router;
};

module.exports = createQuestionRoutes;
