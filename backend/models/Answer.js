const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: [true, 'Session ID is required'],
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Question ID is required'],
  },
  userAnswer: {
    type: String,
    required: [true, 'Answer text is required'],
    trim: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
