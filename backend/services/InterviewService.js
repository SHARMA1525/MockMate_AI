/**
 * Interview Service
 * 
 * The main orchestrator for the interview flow.
 * Coordinates between repositories and the evaluation engine.
 * 
 * INTERVIEW FLOW:
 * 1. startInterview()  → Creates session, picks random questions
 * 2. submitAnswer()    → Saves individual answers during interview
 * 3. submitInterview() → Finalizes session, triggers scoring, creates report
 * 4. getHistory()      → Shows past interview sessions
 * 5. getReport()       → Gets detailed score report for a session
 * 
 * DESIGN PATTERN: Service Layer
 * OOP CONCEPT: Encapsulation, Dependency Injection
 */

const { ErrorFactory } = require('../utils/factory');
const { SESSION_STATUS, SCORING } = require('../utils/constants');
const Logger = require('../utils/logger');

class InterviewService {
  // Private fields — encapsulation
  #interviewRepository;
  #questionRepository;
  #answerRepository;
  #scoreReportRepository;
  #evaluationService;
  #logger;

  /**
   * DEPENDENCY INJECTION — all dependencies passed via constructor
   * This makes the service testable and loosely coupled.
   */
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

  /**
   * Start a new interview session
   * 
   * Steps:
   * 1. Check if user already has an active session
   * 2. Fetch random questions from the chosen category
   * 3. Create the interview session
   * 4. Return session data with questions
   * 
   * @param {string} userId - The user starting the interview
   * @param {string} category - The interview category (e.g., 'JavaScript')
   * @returns {Object} Session data with assigned questions
   */
  async startInterview(userId, category) {
    this.#logger.info(`Starting interview for user: ${userId}, category: ${category}`);

    // Step 1: Check for existing active session
    const activeSession = await this.#interviewRepository.findActiveSession(userId);
    if (activeSession) {
      throw ErrorFactory.conflict(
        'You already have an active interview session. Please complete or submit it first.'
      );
    }

    // Step 2: Fetch random questions for this category
    const questions = await this.#questionRepository.getRandomByCategory(
      category,
      SCORING.QUESTIONS_PER_SESSION
    );

    if (questions.length === 0) {
      throw ErrorFactory.notFound(`No questions available for category: ${category}`);
    }

    // If there are fewer questions than needed, use what we have
    if (questions.length < SCORING.QUESTIONS_PER_SESSION) {
      this.#logger.warn(
        `Only ${questions.length} questions available for ${category} (requested ${SCORING.QUESTIONS_PER_SESSION})`
      );
    }

    // Step 3: Create the interview session
    const session = await this.#interviewRepository.create({
      userId,
      category,
      questionIds: questions.map(q => q._id),
      status: SESSION_STATUS.IN_PROGRESS,
      startTime: new Date(),
    });

    this.#logger.info(`Interview session created: ${session._id}`);

    // Step 4: Return session with questions (without keyword answers!)
    const sanitizedQuestions = questions.map(q => ({
      _id: q._id,
      content: q.content,
      category: q.category,
      difficulty: q.difficulty,
      // Note: We don't send keywords to the frontend — that would be cheating!
    }));

    return {
      session,
      questions: sanitizedQuestions,
    };
  }

  /**
   * Submit an answer for a specific question in a session
   * 
   * @param {string} sessionId - The active session ID
   * @param {string} questionId - The question being answered
   * @param {string} userAnswer - The user's answer text
   * @param {string} userId - The user submitting the answer (for verification)
   * @returns {Object} The saved answer
   */
  async submitAnswer(sessionId, questionId, userAnswer, userId) {
    this.#logger.info(`Answer submitted for session: ${sessionId}, question: ${questionId}`);

    // Verify the session exists and belongs to this user
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

    // Check if this question is part of this session
    const isValidQuestion = session.questionIds.some(
      qId => qId.toString() === questionId
    );
    if (!isValidQuestion) {
      throw ErrorFactory.badRequest('This question is not part of this interview session');
    }

    // Check for duplicate answer
    const existingAnswer = await this.#answerRepository.findBySessionAndQuestion(
      sessionId,
      questionId
    );

    if (existingAnswer) {
      // Update existing answer instead of creating duplicate
      existingAnswer.userAnswer = userAnswer;
      existingAnswer.submittedAt = new Date();
      await existingAnswer.save();
      return existingAnswer;
    }

    // Save the new answer
    const answer = await this.#answerRepository.create({
      sessionId,
      questionId,
      userAnswer,
    });

    return answer;
  }

  /**
   * Submit the entire interview for scoring
   * 
   * This is the critical method that:
   * 1. Validates the session
   * 2. Fetches all answers
   * 3. Runs the scoring engine
   * 4. Creates and saves the score report
   * 5. Marks the session as completed
   * 
   * @param {string} sessionId - The session to finalize
   * @param {string} userId - The user submitting (for verification)
   * @returns {Object} The generated score report
   */
  async submitInterview(sessionId, userId) {
    this.#logger.info(`Submitting interview session: ${sessionId}`);

    // Step 1: Validate session
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

    // Step 2: Fetch all answers for this session (with question data)
    const answers = await this.#answerRepository.findBySessionId(sessionId);

    if (answers.length === 0) {
      throw ErrorFactory.badRequest('No answers submitted. Please answer at least one question.');
    }

    // Step 3: Run the scoring engine
    const evaluationResults = this.#evaluationService.evaluateAnswers(answers);

    // Step 4: Save the score report
    const scoreReport = await this.#scoreReportRepository.create({
      sessionId,
      totalScore: evaluationResults.totalScore,
      maxPossibleScore: evaluationResults.maxPossibleScore,
      questionResults: evaluationResults.questionResults,
      overallFeedback: evaluationResults.overallFeedback,
    });

    // Step 5: Mark session as completed
    await this.#interviewRepository.update(sessionId, {
      status: SESSION_STATUS.COMPLETED,
      endTime: new Date(),
    });

    this.#logger.info(
      `Interview scored: ${evaluationResults.totalScore}/${evaluationResults.maxPossibleScore}`
    );

    return scoreReport;
  }

  /**
   * Get interview history for a user
   * Returns all past sessions with their scores
   */
  async getHistory(userId) {
    this.#logger.info(`Fetching interview history for user: ${userId}`);

    const sessions = await this.#interviewRepository.findByUserId(userId);

    // For each completed session, attach the score
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

  /**
   * Get the detailed score report for a specific session
   */
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
