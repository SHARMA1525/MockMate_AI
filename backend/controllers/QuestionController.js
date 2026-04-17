/**
 * Question Controller
 * 
 * Handles HTTP requests for question management.
 * - Regular users: Can view questions and categories
 * - Admin users: Can create, update, and delete questions
 */

const { ResponseFactory } = require('../utils/factory');
const { HTTP_STATUS } = require('../utils/constants');

class QuestionController {
  #questionService;

  constructor(questionService) {
    this.#questionService = questionService;

    // Bind methods
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getCategories = this.getCategories.bind(this);
  }

  /**
   * GET /api/questions
   * Get all questions, optionally filtered by category
   * Query: ?category=JavaScript
   */
  async getAll(req, res, next) {
    try {
      const { category } = req.query;
      const questions = await this.#questionService.getAllQuestions(category);

      res.status(HTTP_STATUS.OK).json(
        ResponseFactory.success(questions, 'Questions fetched successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/questions/categories
   * Get all available question categories
   */
  async getCategories(req, res, next) {
    try {
      const categories = await this.#questionService.getCategories();

      res.status(HTTP_STATUS.OK).json(
        ResponseFactory.success(categories, 'Categories fetched successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/questions/:id
   * Get a single question by ID
   */
  async getById(req, res, next) {
    try {
      const question = await this.#questionService.getQuestionById(req.params.id);

      res.status(HTTP_STATUS.OK).json(
        ResponseFactory.success(question, 'Question fetched successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/questions (Admin only)
   * Create a new question
   */
  async create(req, res, next) {
    try {
      const question = await this.#questionService.createQuestion(req.body);

      res.status(HTTP_STATUS.CREATED).json(
        ResponseFactory.success(question, 'Question created successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/questions/:id (Admin only)
   * Update an existing question
   */
  async update(req, res, next) {
    try {
      const question = await this.#questionService.updateQuestion(req.params.id, req.body);

      res.status(HTTP_STATUS.OK).json(
        ResponseFactory.success(question, 'Question updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/questions/:id (Admin only)
   * Delete a question
   */
  async delete(req, res, next) {
    try {
      await this.#questionService.deleteQuestion(req.params.id);

      res.status(HTTP_STATUS.OK).json(
        ResponseFactory.success(null, 'Question deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = QuestionController;
