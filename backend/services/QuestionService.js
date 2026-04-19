const { ErrorFactory } = require('../utils/factory');
const Logger = require('../utils/logger');

class QuestionService {
  #questionRepository;
  #logger;

  constructor(questionRepository) {
    this.#questionRepository = questionRepository;
    this.#logger = new Logger('QuestionService');
  }
  async getAllQuestions(category = null) {
    if (category) {
      this.#logger.info(`Fetching questions for category: ${category}`);
      return this.#questionRepository.findByCategory(category);
    }
    return this.#questionRepository.findAll();
  }
  async getQuestionById(questionId) {
    const question = await this.#questionRepository.findById(questionId);
    if (!question) {
      throw ErrorFactory.notFound('Question not found');
    }
    return question;
  }
  async createQuestion(questionData) {
    this.#logger.info(`Creating new question in category: ${questionData.category}`);
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
  async updateQuestion(questionId, updateData) {
    this.#logger.info(`Updating question: ${questionId}`);

    const question = await this.#questionRepository.update(questionId, updateData);
    if (!question) {
      throw ErrorFactory.notFound('Question not found');
    }

    this.#logger.info(`Question updated: ${questionId}`);
    return question;
  }

  async deleteQuestion(questionId) {
    this.#logger.info(`Deleting question: ${questionId}`);

    const question = await this.#questionRepository.delete(questionId);
    if (!question) {
      throw ErrorFactory.notFound('Question not found');
    }

    this.#logger.info(`Question deleted: ${questionId}`);
    return question;
  }

  async getCategories() {
    const questions = await this.#questionRepository.findAll();
    const categories = [...new Set(questions.map(q => q.category))];
    return categories;
  }
}

module.exports = QuestionService;
