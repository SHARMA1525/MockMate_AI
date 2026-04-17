/**
 * Evaluation Service
 * 
 * DESIGN PATTERN: Strategy Pattern (consumer side)
 * OOP CONCEPT: Polymorphism, Dependency Injection
 * 
 * This service evaluates all answers in an interview session.
 * It uses a SCORING STRATEGY (injected via constructor) to
 * score each individual answer.
 * 
 * POLYMORPHISM IN ACTION:
 * The evaluateAnswers() method calls this.#strategy.score()
 * without knowing whether it's using StrictMatchingStrategy
 * or FuzzyMatchingStrategy. The behavior changes based on
 * which strategy object was injected — that's polymorphism.
 * 
 * HOW IT WORKS:
 * 1. Receives an array of answers (with their question data)
 * 2. For each answer, calls the strategy's score() method
 * 3. Aggregates all individual scores into a final report
 * 4. Generates overall feedback based on total performance
 */

const Logger = require('../utils/logger');
const { SCORING } = require('../utils/constants');

class EvaluationService {
  #strategy;
  #logger;

  /**
   * DEPENDENCY INJECTION:
   * The scoring strategy is passed in, not hardcoded.
   * To switch algorithms, you just inject a different strategy.
   * 
   * @param {BaseScoringStrategy} strategy - The scoring strategy to use
   */
  constructor(strategy) {
    this.#strategy = strategy;
    this.#logger = new Logger('EvaluationService');
  }

  /**
   * Change the scoring strategy at runtime
   * This demonstrates the Strategy Pattern — we can swap
   * algorithms without modifying any other code.
   * 
   * @param {BaseScoringStrategy} newStrategy - New strategy to use
   */
  setStrategy(newStrategy) {
    this.#logger.info(`Switching scoring strategy to: ${newStrategy.name}`);
    this.#strategy = newStrategy;
  }

  /**
   * Evaluate all answers for an interview session
   * 
   * This is the core evaluation pipeline:
   * For each answer → score it → collect results → aggregate → generate report
   * 
   * @param {Array} answers - Array of answer documents (with populated question data)
   * @returns {Object} Complete evaluation results for the session
   */
  evaluateAnswers(answers) {
    this.#logger.info(`Evaluating ${answers.length} answers using ${this.#strategy.name} strategy`);

    const questionResults = [];
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Score each answer individually
    for (const answer of answers) {
      const question = answer.questionId; // Populated from MongoDB

      // Use the strategy to score this answer (POLYMORPHISM)
      const result = this.#strategy.score(answer.userAnswer, question);

      // Collect the result
      questionResults.push({
        questionId: question._id,
        score: result.score,
        maxScore: result.maxScore,
        matchedKeywords: result.matchedKeywords,
        missedKeywords: result.missedKeywords,
        feedback: result.feedback,
      });

      totalScore += result.score;
      maxPossibleScore += result.maxScore;
    }

    // Generate overall feedback based on total performance
    const overallFeedback = this._generateOverallFeedback(totalScore, maxPossibleScore);

    this.#logger.info(`Evaluation complete. Score: ${totalScore}/${maxPossibleScore}`);

    return {
      totalScore,
      maxPossibleScore,
      questionResults,
      overallFeedback,
    };
  }

  /**
   * Generate overall feedback message based on total score
   * 
   * @param {number} totalScore - Sum of all question scores
   * @param {number} maxScore - Maximum possible total score
   * @returns {string} Overall feedback message
   */
  _generateOverallFeedback(totalScore, maxScore) {
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    if (percentage >= 90) {
      return 'Outstanding performance! You demonstrated excellent knowledge across all topics.';
    } else if (percentage >= 75) {
      return 'Great job! You have strong understanding with minor gaps. Review the missed keywords.';
    } else if (percentage >= 60) {
      return 'Good effort! You covered the basics but missed several key concepts. Focus on the missed areas.';
    } else if (percentage >= 40) {
      return 'Fair attempt. There are significant knowledge gaps. We recommend reviewing the topics thoroughly.';
    } else {
      return 'This topic needs more study. Review the fundamentals and practice again.';
    }
  }
}

module.exports = EvaluationService;
