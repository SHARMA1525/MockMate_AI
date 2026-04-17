/**
 * ScoreReport Model
 * 
 * Generated after an interview is submitted and scored.
 * Contains the overall score, per-question breakdown,
 * matched/missed keywords, and feedback text.
 * 
 * This is the "result card" the user sees after finishing
 * an interview session.
 */

const mongoose = require('mongoose');

// Sub-schema for individual question results
const questionResultSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  maxScore: {
    type: Number,
    required: true,
  },
  matchedKeywords: {
    type: [String],
    default: [],
  },
  missedKeywords: {
    type: [String],
    default: [],
  },
  feedback: {
    type: String,
    default: '',
  },
}, { _id: false });

const scoreReportSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: [true, 'Session ID is required'],
    unique: true,  // One report per session
  },
  totalScore: {
    type: Number,
    required: true,
  },
  maxPossibleScore: {
    type: Number,
    required: true,
  },
  // Detailed breakdown for each question
  questionResults: {
    type: [questionResultSchema],
    default: [],
  },
  overallFeedback: {
    type: String,
    default: '',
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ScoreReport = mongoose.model('ScoreReport', scoreReportSchema);

module.exports = ScoreReport;
