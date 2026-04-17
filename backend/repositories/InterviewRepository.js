/**
 * Interview Repository
 * 
 * Extends BaseRepository with interview-session-specific queries.
 * Handles finding sessions by user, checking for active sessions, etc.
 */

const BaseRepository = require('./BaseRepository');
const InterviewSession = require('../models/InterviewSession');
const { SESSION_STATUS } = require('../utils/constants');

class InterviewRepository extends BaseRepository {
  constructor() {
    super(InterviewSession);
  }

  /**
   * Find all interview sessions for a specific user
   * Sorted by most recent first — used for interview history
   * 
   * @param {string} userId - The user's ID
   * @returns {Promise<Array>} Array of session documents
   */
  async findByUserId(userId) {
    return this.model
      .find({ userId })
      .sort({ startTime: -1 })  // Most recent first
      .populate('questionIds', 'content category difficulty');
  }

  /**
   * Check if the user has an active (in-progress) session
   * We prevent starting a new interview while one is already active
   * 
   * @param {string} userId - The user's ID
   * @returns {Promise<Object|null>} Active session or null
   */
  async findActiveSession(userId) {
    return this.model.findOne({
      userId,
      status: SESSION_STATUS.IN_PROGRESS,
    });
  }
}

module.exports = InterviewRepository;
