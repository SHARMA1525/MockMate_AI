/**
 * Question Service
 * 
 * Business logic for managing interview questions.
 * Used by both the admin panel (CRUD operations) and
 * the interview system (fetching questions by category).
 * 
 * DESIGN PATTERN: Service Layer
 * OOP CONCEPT: Encapsulation (private fields)
 */

const { ErrorFactory } = require('../utils/factory');
const Logger = require('../utils/logger');

class QuestionService {
  #questionRepository;
  #logger;

  constructor(questionRepository) {
    this.#questionRepository = questionRepository;
    this.#logger = new Logger('QuestionService');
  }

  /**
   * Get all questions, optionally filtered by category
   */
  async getAllQuestions(category = null) {
    if (category) {
      this.#logger.info(`Fetching questions for category: ${category}`);
      return this.#questionRepository.findByCategory(category);
    }
    return this.#questionRepository.findAll();
  }

  /**
   * Get a single question by ID
   */
  async getQuestionById(questionId) {
    const question = await this.#questionRepository.findById(questionId);
    if (!question) {
      throw ErrorFactory.notFound('Question not found');
    }
    return question;
  }

  /**
   * Create a new question (Admin only)
   * Validates that required keywords are provided
   */
  async createQuestion(questionData) {
    this.#logger.info(`Creating new question in category: ${questionData.category}`);

    // Ensure keywords are lowercase for consistent matching
    if (questionData.requiredKeywords) {
      questionData.requiredKeywords = questionData.requiredKeywords.map(kw => ({
        keyword: kw.keyword.toLowerCase().trim(),
        weight: kw.weight || 1,
      }));
    }

    if (questionData.bonusKeywords) {
      questionData.bonusKeywords = questionData.bonusKeywords.map(kw => ({
        keyword: kw.keyword.toLowerCase().trim(),
        weight: kw.weight || 1,
      }));
    }

    const question = await this.#questionRepository.create(questionData);
    this.#logger.info(`Question created with ID: ${question._id}`);
    return question;
  }

  /**
   * Update an existing question (Admin only)
   */
  async updateQuestion(questionId, updateData) {
    this.#logger.info(`Updating question: ${questionId}`);

    const question = await this.#questionRepository.update(questionId, updateData);
    if (!question) {
      throw ErrorFactory.notFound('Question not found');
    }

    this.#logger.info(`Question updated: ${questionId}`);
    return question;
  }

  /**
   * Delete a question (Admin only)
   */
  async deleteQuestion(questionId) {
    this.#logger.info(`Deleting question: ${questionId}`);

    const question = await this.#questionRepository.delete(questionId);
    if (!question) {
      throw ErrorFactory.notFound('Question not found');
    }

    this.#logger.info(`Question deleted: ${questionId}`);
    return question;
  }

  /**
   * Get all unique categories
   * Used to populate the category dropdown on the frontend
   */
  async getCategories() {
    const questions = await this.#questionRepository.findAll();
    const categories = [...new Set(questions.map(q => q.category))];
    return categories;
  }
}

module.exports = QuestionService;
