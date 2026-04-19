const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

const startInterviewSchema = {
  category: { type: 'string', required: true },
};

const submitAnswerSchema = {
  questionId: { type: 'string', required: true },
  userAnswer: { type: 'string', required: true },
};

const createInterviewRoutes = (interviewController) => {
  const router = express.Router();
  router.use(authMiddleware);

  router.post('/start', validate(startInterviewSchema), interviewController.startInterview);

  router.post('/:sessionId/answer', validate(submitAnswerSchema), interviewController.submitAnswer);

  router.post('/:sessionId/submit', interviewController.submitInterview);

  router.get('/history', interviewController.getHistory);

  router.get('/:sessionId/report', interviewController.getReport);

  router.post('/:sessionId/cancel', interviewController.cancelInterview);

  return router;
};

module.exports = createInterviewRoutes;
