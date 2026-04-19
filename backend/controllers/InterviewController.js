const { ResponseFactory } = require('../utils/factory');
const { HTTP_STATUS } = require('../utils/constants');

class InterviewController {
  #interviewService;

  constructor(interviewService) {
    this.#interviewService = interviewService;

    this.startInterview = this.startInterview.bind(this);
    this.submitAnswer = this.submitAnswer.bind(this);
    this.submitInterview = this.submitInterview.bind(this);
    this.getHistory = this.getHistory.bind(this);
    this.getReport = this.getReport.bind(this);
    this.cancelInterview = this.cancelInterview.bind(this);
  }
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

  async cancelInterview(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const result = await this.#interviewService.cancelInterview(sessionId, userId);

      res.status(HTTP_STATUS.OK).json(
        ResponseFactory.success(result, 'Interview cancelled successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InterviewController;
