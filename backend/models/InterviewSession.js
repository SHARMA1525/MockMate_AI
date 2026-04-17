/**
 * InterviewSession Model
 * 
 * Tracks a single interview attempt by a user.
 * A session starts when the user begins an interview and
 * ends when they submit all answers for scoring.
 * 
 * Each session is linked to:
 * - One user (who took the interview)
 * - Multiple questions (assigned for this session)
 */

const mongoose = require('mongoose');
const { SESSION_STATUS } = require('../utils/constants');

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  category: {
    type: String,
    required: [true, 'Interview category is required'],
  },
  status: {
    type: String,
    enum: Object.values(SESSION_STATUS),
    default: SESSION_STATUS.IN_PROGRESS,
  },
  // Array of question IDs assigned to this interview session
  questionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    default: null,
  },
});

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

module.exports = InterviewSession;
