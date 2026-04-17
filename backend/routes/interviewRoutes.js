/**
 * Interview Routes
 * 
 * All routes here require authentication.
 * Maps interview-related endpoints to InterviewController methods.
 */

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

// Validation schemas
const startInterviewSchema = {
  category: { type: 'string', required: true },
};

const submitAnswerSchema = {
  questionId: { type: 'string', required: true },
  userAnswer: { type: 'string', required: true },
};

/**
 * Create interview router with injected controller
 * @param {InterviewController} interviewController - Injected controller instance
 * @returns {express.Router} Configured router
 */
const createInterviewRoutes = (interviewController) => {
  const router = express.Router();

  // All interview routes require authentication
  router.use(authMiddleware);

  // Start a new interview session
  router.post('/start', validate(startInterviewSchema), interviewController.startInterview);

  // Submit an answer for a question
  router.post('/:sessionId/answer', validate(submitAnswerSchema), interviewController.submitAnswer);

  // Submit the entire interview for scoring
  router.post('/:sessionId/submit', interviewController.submitInterview);

  // Get interview history for the logged-in user
  router.get('/history', interviewController.getHistory);

  // Get detailed score report for a specific session
  router.get('/:sessionId/report', interviewController.getReport);

  return router;
};

module.exports = createInterviewRoutes;
