/**
 * Fuzzy Matching Strategy
 * 
 * OOP CONCEPTS: Inheritance, Method Overriding, Polymorphism
 * 
 * This strategy performs FUZZY keyword matching.
 * It tolerates typos and partial matches using a
 * simple string similarity algorithm.
 * 
 * Example:
 *   keyword: "closure"
 *   answer: "clousre is important" (typo)
 *   Similarity: ~0.85 → above 0.75 threshold → MATCHED ✓
 * 
 * The fuzzy matching uses a simplified version of 
 * character-level comparison (not a full Levenshtein distance,
 * which keeps the code readable and simple).
 */

const BaseScoringStrategy = require('./BaseScoringStrategy');
const { SCORING } = require('../../utils/constants');

class FuzzyMatchingStrategy extends BaseScoringStrategy {
  constructor() {
    super();
    this.name = 'fuzzy';
  }

  /**
   * Score the answer using fuzzy keyword matching
   * 
   * METHOD OVERRIDE: Replaces the parent's abstract score() method.
   * Same interface as StrictMatchingStrategy, different behavior.
   * This is POLYMORPHISM in action.
   */
  score(userAnswer, question) {
    const normalizedAnswer = this._normalizeText(userAnswer);

    let totalScore = 0;
    let maxScore = 0;
    const matchedKeywords = [];
    const missedKeywords = [];

    // --- Score Required Keywords ---
    for (const keywordObj of question.requiredKeywords) {
      const keywordWeight = keywordObj.weight * SCORING.REQUIRED_KEYWORD_WEIGHT;
      maxScore += keywordWeight;

      if (this._fuzzyMatchKeyword(normalizedAnswer, keywordObj.keyword)) {
        totalScore += keywordWeight;
        matchedKeywords.push(keywordObj.keyword);
      } else {
        missedKeywords.push(keywordObj.keyword);
      }
    }

    // --- Score Bonus Keywords ---
    for (const keywordObj of question.bonusKeywords || []) {
      const keywordWeight = keywordObj.weight * SCORING.BONUS_KEYWORD_WEIGHT;
      maxScore += keywordWeight;

      if (this._fuzzyMatchKeyword(normalizedAnswer, keywordObj.keyword)) {
        totalScore += keywordWeight;
        matchedKeywords.push(keywordObj.keyword);
      } else {
        missedKeywords.push(keywordObj.keyword);
      }
    }

    // Scale score to max points per question (0-20)
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
   * Check if a keyword exists in the answer with fuzzy tolerance
   * 
   * First tries exact match (fast path).
   * If no exact match, compares each word in the answer
   * to the keyword using similarity scoring.
   * 
   * @param {string} normalizedAnswer - Cleaned answer text
   * @param {string} keyword - Keyword to search for
   * @returns {boolean} Whether a fuzzy match was found
   */
  _fuzzyMatchKeyword(normalizedAnswer, keyword) {
    const normalizedKeyword = keyword.toLowerCase().trim();

    // Fast path: check exact match first
    if (normalizedAnswer.includes(normalizedKeyword)) {
      return true;
    }

    // Slow path: check each word for fuzzy similarity
    const words = normalizedAnswer.split(' ');

    for (const word of words) {
      const similarity = this._calculateSimilarity(word, normalizedKeyword);
      if (similarity >= SCORING.FUZZY_MATCH_THRESHOLD) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate similarity between two strings (0 to 1)
   * 
   * Uses a simple bigram-based similarity metric.
   * Bigrams are pairs of consecutive characters.
   * 
   * Example:
   *   "closure" → ["cl", "lo", "os", "su", "ur", "re"]
   *   "clousre" → ["cl", "lo", "ou", "us", "sr", "re"]
   *   Common: ["cl", "lo", "re"] → 3 out of 6 → similarity = 0.5
   * 
   * This is simpler than Levenshtein distance but works well for typo detection.
   * 
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score between 0 and 1
   */
  _calculateSimilarity(str1, str2) {
    // If either string is too short, use character comparison
    if (str1.length < 2 || str2.length < 2) {
      return str1 === str2 ? 1 : 0;
    }

    // Generate bigrams for both strings
    const bigrams1 = this._getBigrams(str1);
    const bigrams2 = this._getBigrams(str2);

    // Count common bigrams
    let commonCount = 0;
    const bigrams2Copy = [...bigrams2];  // Copy so we can remove matched ones

    for (const bigram of bigrams1) {
      const index = bigrams2Copy.indexOf(bigram);
      if (index !== -1) {
        commonCount++;
        bigrams2Copy.splice(index, 1);  // Remove to prevent double counting
      }
    }

    // Dice's coefficient: 2 * common / total
    const totalBigrams = bigrams1.length + bigrams2.length;
    return (2 * commonCount) / totalBigrams;
  }

  /**
   * Split a string into bigrams (pairs of consecutive characters)
   * 
   * @param {string} str - Input string
   * @returns {Array<string>} Array of bigrams
   */
  _getBigrams(str) {
    const bigrams = [];
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.push(str.substring(i, i + 2));
    }
    return bigrams;
  }
}

module.exports = FuzzyMatchingStrategy;
