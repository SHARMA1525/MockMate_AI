/**
 * Answer Repository
 * 
 * Extends BaseRepository with answer-specific queries.
 * Primarily used to find all answers within a session.
 */

const BaseRepository = require('./BaseRepository');
const Answer = require('../models/Answer');

class AnswerRepository extends BaseRepository {
  constructor() {
    super(Answer);
  }

  /**
   * Find all answers for a specific interview session
   * Populates the question data so we can access keywords for scoring
   * 
   * @param {string} sessionId - The interview session ID
   * @returns {Promise<Array>} Array of answer documents with question data
   */
  async findBySessionId(sessionId) {
    return this.model
      .find({ sessionId })
      .populate('questionId');  // Include the full question document
  }

  /**
   * Check if a question has already been answered in this session
   * Prevents duplicate answers for the same question
   * 
   * @param {string} sessionId - Session ID
   * @param {string} questionId - Question ID
   * @returns {Promise<Object|null>} Existing answer or null
   */
  async findBySessionAndQuestion(sessionId, questionId) {
    return this.model.findOne({ sessionId, questionId });
  }
}

module.exports = AnswerRepository;
