/**
 * Question Model
 * 
 * Represents an interview question in the database.
 * Each question has a category, difficulty level, and two types of keywords:
 * 
 * - requiredKeywords: Must be present in a good answer (higher weight)
 * - bonusKeywords: Nice to have in an answer (lower weight)
 * 
 * The keywords are used by the Scoring Engine to evaluate user answers.
 */

const mongoose = require('mongoose');
const { CATEGORIES, DIFFICULTY } = require('../utils/constants');

// Sub-schema for keywords with their weight values
const keywordSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,  // Store lowercase for easier matching
  },
  weight: {
    type: Number,
    required: true,
    default: 1,
    min: [1, 'Weight must be at least 1'],
    max: [5, 'Weight cannot exceed 5'],
  },
}, { _id: false });  // No need for separate IDs on sub-documents

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
  // Keywords that MUST be in a good answer
  requiredKeywords: {
    type: [keywordSchema],
    validate: {
      validator: function (arr) {
        return arr.length > 0;
      },
      message: 'At least one required keyword is needed',
    },
  },
  // Keywords that are nice-to-have bonus points
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
