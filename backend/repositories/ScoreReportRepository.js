/**
 * Score Report Repository
 * 
 * Extends BaseRepository with report-specific queries.
 * Used to fetch score reports linked to interview sessions.
 */

const BaseRepository = require('./BaseRepository');
const ScoreReport = require('../models/ScoreReport');

class ScoreReportRepository extends BaseRepository {
  constructor() {
    super(ScoreReport);
  }

  /**
   * Find the score report for a specific interview session
   * Populates question details for the results breakdown
   * 
   * @param {string} sessionId - The interview session ID
   * @returns {Promise<Object|null>} Score report or null
   */
  async findBySessionId(sessionId) {
    return this.model
      .findOne({ sessionId })
      .populate('questionResults.questionId', 'content category difficulty');
  }

  /**
   * Get all reports for a specific user (across all their sessions)
   * Used for the interview history page
   * 
   * @param {Array<string>} sessionIds - Array of session IDs
   * @returns {Promise<Array>} Array of score reports
   */
  async findBySessionIds(sessionIds) {
    return this.model
      .find({ sessionId: { $in: sessionIds } })
      .sort({ generatedAt: -1 });
  }
}

module.exports = ScoreReportRepository;
