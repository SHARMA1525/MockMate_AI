/**
 * Base Scoring Strategy - Abstract Class
 * 
 * DESIGN PATTERN: Strategy Pattern
 * OOP CONCEPTS: Abstraction, Polymorphism, Method Overriding
 * 
 * This is the ABSTRACT base class for all scoring strategies.
 * It defines the interface that all strategies must follow:
 * - score(userAnswer, question): returns a scoring result
 * 
 * WHY STRATEGY PATTERN?
 * The scoring algorithm can change without modifying the
 * EvaluationService. We currently support two strategies:
 * 
 * 1. StrictMatchingStrategy — exact keyword matching
 * 2. FuzzyMatchingStrategy — allows typos and partial matches
 * 
 * To add a new strategy, simply create a class that extends
 * BaseScoringStrategy and overrides the score() method.
 * The EvaluationService doesn't need to change at all.
 * 
 * ABSTRACTION:
 * The EvaluationService calls strategy.score() without knowing
 * which specific strategy is being used. This is polymorphism
 * in action — the same method call behaves differently depending
 * on which strategy object is being used.
 */

class BaseScoringStrategy {
  constructor() {
    // Prevent direct instantiation of this abstract class
    if (new.target === BaseScoringStrategy) {
      throw new Error('BaseScoringStrategy is abstract. Use a concrete strategy like StrictMatchingStrategy.');
    }

    this.name = 'base';
  }

  /**
   * Score a user's answer against a question's keywords.
   * 
   * MUST be overridden by subclasses.
   * This method is the "contract" that all strategies must fulfill.
   * 
   * @param {string} userAnswer - The user's text answer
   * @param {Object} question - Question document with requiredKeywords and bonusKeywords
   * @returns {Object} Result with score, maxScore, matchedKeywords, missedKeywords, feedback
   */
  score(userAnswer, question) {
    throw new Error('score() method must be implemented by subclass');
  }

  /**
   * Shared helper: Clean and normalize the answer text
   * Both strategies use this to prepare text for matching.
   * 
   * @param {string} text - Raw text to normalize
   * @returns {string} Cleaned, lowercase text
   */
  _normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
      .replace(/\s+/g, ' ')      // Collapse multiple spaces
      .trim();
  }

  /**
   * Shared helper: Generate feedback based on score percentage
   * 
   * @param {number} score - Achieved score
   * @param {number} maxScore - Maximum possible score
   * @param {Array} missedKeywords - Keywords the user missed
   * @returns {string} Feedback message
   */
  _generateFeedback(score, maxScore, missedKeywords) {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    if (percentage >= 90) {
      return 'Excellent! You covered almost all key concepts.';
    } else if (percentage >= 70) {
      return `Good answer! You missed: ${missedKeywords.join(', ')}.`;
    } else if (percentage >= 50) {
      return `Fair attempt. Key concepts missed: ${missedKeywords.join(', ')}.`;
    } else {
      return `Needs improvement. Important concepts you should study: ${missedKeywords.join(', ')}.`;
    }
  }
}

module.exports = BaseScoringStrategy;
