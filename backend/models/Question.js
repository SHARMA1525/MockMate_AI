const mongoose = require('mongoose');
const { CATEGORIES, DIFFICULTY } = require('../utils/constants');

const keywordSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  weight: {
    type: Number,
    required: true,
    default: 1,
    min: [1, 'Weight must be at least 1'],
    max: [5, 'Weight cannot exceed 5'],
  },
}, { _id: false }); 

const questionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: Object.values(CATEGORIES),
  },
  content: {
    type: String,
    required: [true, 'Question content is required'],
    trim: true,
  },
  difficulty: {
    type: String,
    enum: Object.values(DIFFICULTY),
    default: DIFFICULTY.MEDIUM,
  },
  requiredKeywords: {
    type: [keywordSchema],
    validate: {
      validator: function (arr) {
        return arr.length > 0;
      },
      message: 'At least one required keyword is needed',
    },
  },

  bonusKeywords: {
    type: [keywordSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
