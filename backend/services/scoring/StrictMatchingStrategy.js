/**
 * Strict Matching Strategy
 * 
 * OOP CONCEPTS: Inheritance, Method Overriding, Polymorphism
 * 
 * This strategy performs EXACT keyword matching.
 * A keyword is considered "matched" only if it appears
 * exactly (case-insensitive) in the user's answer.
 * 
 * Example:
 *   keyword: "closure"
 *   answer: "A closure is a function that remembers its scope"
 *   Result: MATCHED ✓
 * 
 *   keyword: "closure"
 *   answer: "clousre is important" (typo)
 *   Result: NOT MATCHED ✗ (use FuzzyStrategy for typo tolerance)
 */

const BaseScoringStrategy = require('./BaseScoringStrategy');
const { SCORING } = require('../../utils/constants');

class StrictMatchingStrategy extends BaseScoringStrategy {
  constructor() {
    super();
    this.name = 'strict';
  }

  /**
   * Score the answer using strict keyword matching
   * 
   * METHOD OVERRIDE: This replaces the parent's abstract score() method.
   * This is POLYMORPHISM — the EvaluationService calls strategy.score()
   * and this specific implementation runs when using StrictMatchingStrategy.
   * 
   * @param {string} userAnswer - The user's answer text
   * @param {Object} question - Question with requiredKeywords and bonusKeywords
   * @returns {Object} Scoring result
   */
  score(userAnswer, question) {
    const normalizedAnswer = this._normalizeText(userAnswer);
    
    let totalScore = 0;
    let maxScore = 0;
    const matchedKeywords = [];
    const missedKeywords = [];

    // --- Score Required Keywords (higher weight) ---
    for (const keywordObj of question.requiredKeywords) {
      const keywordWeight = keywordObj.weight * SCORING.REQUIRED_KEYWORD_WEIGHT;
      maxScore += keywordWeight;

      if (this._matchKeyword(normalizedAnswer, keywordObj.keyword)) {
        totalScore += keywordWeight;
        matchedKeywords.push(keywordObj.keyword);
      } else {
        missedKeywords.push(keywordObj.keyword);
      }
    }

    // --- Score Bonus Keywords (lower weight) ---
    for (const keywordObj of question.bonusKeywords || []) {
      const keywordWeight = keywordObj.weight * SCORING.BONUS_KEYWORD_WEIGHT;
      maxScore += keywordWeight;

      if (this._matchKeyword(normalizedAnswer, keywordObj.keyword)) {
        totalScore += keywordWeight;
        matchedKeywords.push(keywordObj.keyword);
      } else {
        missedKeywords.push(keywordObj.keyword);
      }
    }

    // Scale score to the max points per question (0-20)
    const scaledScore = maxScore > 0
      ? Math.round((totalScore / maxScore) * SCORING.MAX_SCORE_PER_QUESTION)
      : 0;

    const feedback = this._generateFeedback(totalScore, maxScore, missedKeywords);

    return {
      score: scaledScore,
      maxScore: SCORING.MAX_SCORE_PER_QUESTION,
      matchedKeywords,
      missedKeywords,
      feedback,
    };
  }

  /**
   * Check if a keyword exists in the answer (exact match)
   * 
   * Uses word boundary matching so "close" doesn't match "closure"
   * 
   * @param {string} normalizedAnswer - Cleaned answer text
   * @param {string} keyword - Keyword to search for
   * @returns {boolean} Whether the keyword was found
   */
  _matchKeyword(normalizedAnswer, keyword) {
    const normalizedKeyword = keyword.toLowerCase().trim();

    // For multi-word keywords, check if the phrase exists in the answer
    if (normalizedKeyword.includes(' ')) {
      return normalizedAnswer.includes(normalizedKeyword);
    }

    // For single-word keywords, use word boundary check
    const words = normalizedAnswer.split(' ');
    return words.includes(normalizedKeyword);
  }
}

module.exports = StrictMatchingStrategy;
