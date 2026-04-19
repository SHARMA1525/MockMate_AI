const mongoose = require('mongoose');

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
    unique: true, 
  },
  totalScore: {
    type: Number,
    required: true,
  },
  maxPossibleScore: {
    type: Number,
    required: true,
  },
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
