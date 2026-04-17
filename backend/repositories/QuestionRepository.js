/**
 * Question Repository
 * 
 * Extends BaseRepository with question-specific queries.
 * Includes methods for fetching questions by category
 * and getting random questions for interview sessions.
 */

const BaseRepository = require('./BaseRepository');
const Question = require('../models/Question');

class QuestionRepository extends BaseRepository {
  constructor() {
    super(Question);
  }

  /**
   * Find all questions in a specific category
   * 
   * @param {string} category - Category to filter by (e.g., 'JavaScript')
   * @returns {Promise<Array>} Array of question documents
   */
  async findByCategory(category) {
    return this.model.find({ category });
  }

  /**
   * Get a random set of questions from a category
   * 
   * Uses MongoDB's $sample aggregation to pick random documents.
   * This is used when starting an interview — we pick N random
   * questions so each interview is different.
   * 
   * @param {string} category - Category to pick from
   * @param {number} count - How many questions to pick
   * @returns {Promise<Array>} Array of random question documents
   */
  async getRandomByCategory(category, count) {
    return this.model.aggregate([
      { $match: { category } },       // Filter by category first
      { $sample: { size: count } },    // Then pick random ones
    ]);
  }
}

module.exports = QuestionRepository;
