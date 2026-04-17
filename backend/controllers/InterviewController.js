/**
 * Interview Controller
 * 
 * Handles HTTP requests for the interview flow:
 * starting, answering questions, submitting, and viewing results.
 */

const { ResponseFactory } = require('../utils/factory');
const { HTTP_STATUS } = require('../utils/constants');

class InterviewController {
  #interviewService;

  constructor(interviewService) {
    this.#interviewService = interviewService;

    // Bind methods to preserve 'this' context
    this.startInterview = this.startInterview.bind(this);
    this.submitAnswer = this.submitAnswer.bind(this);
    this.submitInterview = this.submitInterview.bind(this);
    this.getHistory = this.getHistory.bind(this);
    this.getReport = this.getReport.bind(this);
  }

  /**
   * POST /api/interviews/start
   * Start a new interview session
   * Body: { category: "JavaScript" }
   */
  async startInterview(req, res, next) {
    try {
      const { category } = req.body;
      const userId = req.user.id;

      const result = await this.#interviewService.startInterview(userId, category);

      res.status(HTTP_STATUS.CREATED).json(
        ResponseFactory.success(result, 'Interview session started')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/interviews/:sessionId/answer
   * Submit an answer for a question
   * Body: { questionId: "...", userAnswer: "..." }
   */
  async submitAnswer(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { questionId, userAnswer } = req.body;
      const userId = req.user.id;

      const answer = await this.#interviewService.submitAnswer(
        sessionId, questionId, userAnswer, userId
      );

      res.status(HTTP_STATUS.CREATED).json(
        ResponseFactory.success(answer, 'Answer submitted successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/interviews/:sessionId/submit
   * Submit the interview for scoring
   */
  async submitInterview(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const report = await this.#interviewService.submitInterview(sessionId, userId);

      res.status(HTTP_STATUS.OK).json(
        ResponseFactory.success(report, 'Interview submitted and scored successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/interviews/history
   * Get the authenticated user's interview history
   */
  async getHistory(req, res, next) {
    try {
      const userId = req.user.id;

      const history = await this.#interviewService.getHistory(userId);

      res.status(HTTP_STATUS.OK).json(
        ResponseFactory.success(history, 'Interview history fetched')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/interviews/:sessionId/report
   * Get the detailed score report for a session
   */
  async getReport(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const report = await this.#interviewService.getReport(sessionId, userId);

      res.status(HTTP_STATUS.OK).json(
        ResponseFactory.success(report, 'Score report fetched')
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InterviewController;
