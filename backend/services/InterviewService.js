const { ErrorFactory } = require('../utils/factory');
const { SESSION_STATUS, SCORING } = require('../utils/constants');
const Logger = require('../utils/logger');

class InterviewService {
  #interviewRepository;
  #questionRepository;
  #answerRepository;
  #scoreReportRepository;
  #evaluationService;
  #logger;
  constructor(
    interviewRepository,
    questionRepository,
    answerRepository,
    scoreReportRepository,
    evaluationService
  ) {
    this.#interviewRepository = interviewRepository;
    this.#questionRepository = questionRepository;
    this.#answerRepository = answerRepository;
    this.#scoreReportRepository = scoreReportRepository;
    this.#evaluationService = evaluationService;
    this.#logger = new Logger('InterviewService');
  }


  async startInterview(userId, category) {
    this.#logger.info(`Starting interview for user: ${userId}, category: ${category}`);

    let activeSession = await this.#interviewRepository.findActiveSession(userId);

    if (activeSession) {
      const ageHours = (Date.now() - activeSession.startTime.getTime()) / (1000 * 60);
      if (ageHours > 30) {
        await this.#interviewRepository.update(activeSession._id, { status: SESSION_STATUS.ABANDONED });
        activeSession = null;
      } else {
        throw ErrorFactory.conflict('You already have an active interview session. Please complete or submit it first.');
      }
    }

    const questions = await this.#questionRepository.getRandomByCategory(
      category,
      SCORING.QUESTIONS_PER_SESSION
    );

    if (questions.length === 0) {
      throw ErrorFactory.notFound(`No questions available for category: ${category}`);
    }

    if (questions.length < SCORING.QUESTIONS_PER_SESSION) {
      this.#logger.warn(
        `Only ${questions.length} questions available for ${category} (requested ${SCORING.QUESTIONS_PER_SESSION})`
      );
    }

    const session = await this.#interviewRepository.create({
      userId,
      category,
      questionIds: questions.map(q => q._id),
      status: SESSION_STATUS.IN_PROGRESS,
      startTime: new Date(),
    });

    this.#logger.info(`Interview session created: ${session._id}`);

    const sanitizedQuestions = questions.map(q => ({
      _id: q._id,
      content: q.content,
      category: q.category,
      difficulty: q.difficulty,

    }));

    return {
      session,
      questions: sanitizedQuestions,
    };
  }


  async submitAnswer(sessionId, questionId, userAnswer, userId) {
    this.#logger.info(`Answer submitted for session: ${sessionId}, question: ${questionId}`);

    const session = await this.#interviewRepository.findById(sessionId);
    if (!session) {
      throw ErrorFactory.notFound('Interview session not found');
    }

    if (session.userId.toString() !== userId) {
      throw ErrorFactory.forbidden('This is not your interview session');
    }

    if (session.status !== SESSION_STATUS.IN_PROGRESS) {
      throw ErrorFactory.badRequest('This interview session has already been submitted');
    }

    const isValidQuestion = session.questionIds.some(
      qId => qId.toString() === questionId
    );
    if (!isValidQuestion) {
      throw ErrorFactory.badRequest('This question is not part of this interview session');
    }

    const existingAnswer = await this.#answerRepository.findBySessionAndQuestion(
      sessionId,
      questionId
    );

    if (existingAnswer) {
      existingAnswer.userAnswer = userAnswer;
      existingAnswer.submittedAt = new Date();
      await existingAnswer.save();
      return existingAnswer;
    }

    const answer = await this.#answerRepository.create({
      sessionId,
      questionId,
      userAnswer,
    });

    return answer;
  }

  async submitInterview(sessionId, userId) {
    this.#logger.info(`Submitting interview session: ${sessionId}`);

    const session = await this.#interviewRepository.findById(sessionId);
    if (!session) {
      throw ErrorFactory.notFound('Interview session not found');
    }

    if (session.userId.toString() !== userId) {
      throw ErrorFactory.forbidden('This is not your interview session');
    }

    if (session.status === SESSION_STATUS.COMPLETED) {
      throw ErrorFactory.badRequest('This interview has already been submitted and scored');
    }

    const answers = await this.#answerRepository.findBySessionId(sessionId);

    if (answers.length === 0) {
      throw ErrorFactory.badRequest('No answers submitted. Please answer at least one question.');
    }

    const evaluationResults = this.#evaluationService.evaluateAnswers(answers);

    const scoreReport = await this.#scoreReportRepository.create({
      sessionId,
      totalScore: evaluationResults.totalScore,
      maxPossibleScore: evaluationResults.maxPossibleScore,
      questionResults: evaluationResults.questionResults,
      overallFeedback: evaluationResults.overallFeedback,
    });

    await this.#interviewRepository.update(sessionId, {
      status: SESSION_STATUS.COMPLETED,
      endTime: new Date(),
    });

    this.#logger.info(
      `Interview scored: ${evaluationResults.totalScore}/${evaluationResults.maxPossibleScore}`
    );

    return scoreReport;
  }
  async getHistory(userId) {
    this.#logger.info(`Fetching interview history for user: ${userId}`);

    const sessions = await this.#interviewRepository.findByUserId(userId);

    const history = [];
    for (const session of sessions) {
      let report = null;
      if (session.status === SESSION_STATUS.COMPLETED) {
        report = await this.#scoreReportRepository.findBySessionId(session._id);
      }

      history.push({
        session,
        totalScore: report ? report.totalScore : null,
        maxScore: report ? report.maxPossibleScore : null,
      });
    }

    return history;
  }

  async getReport(sessionId, userId) {
    const session = await this.#interviewRepository.findById(sessionId);
    if (!session) {
      throw ErrorFactory.notFound('Interview session not found');
    }

    if (session.userId.toString() !== userId) {
      throw ErrorFactory.forbidden('This is not your interview session');
    }

    const report = await this.#scoreReportRepository.findBySessionId(sessionId);
    if (!report) {
      throw ErrorFactory.notFound('Score report not found. Has this interview been submitted?');
    }

    return report;
  }
}

module.exports = InterviewService;
