const Logger = require('../utils/logger');
const { SCORING } = require('../utils/constants');

class EvaluationService {
  #strategy;
  #logger;

  constructor(strategy) {
    this.#strategy = strategy;
    this.#logger = new Logger('EvaluationService');
  }

  setStrategy(newStrategy) {
    this.#logger.info(`Switching scoring strategy to: ${newStrategy.name}`);
    this.#strategy = newStrategy;
  }

  evaluateAnswers(answers) {
    this.#logger.info(`Evaluating ${answers.length} answers using ${this.#strategy.name} strategy`);

    const questionResults = [];
    let totalScore = 0;
    let maxPossibleScore = 0;

    for (const answer of answers) {
      const question = answer.questionId;

      const result = this.#strategy.score(answer.userAnswer, question);

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

    const overallFeedback = this._generateOverallFeedback(totalScore, maxPossibleScore);

    this.#logger.info(`Evaluation complete. Score: ${totalScore}/${maxPossibleScore}`);

    return {
      totalScore,
      maxPossibleScore,
      questionResults,
      overallFeedback,
    };
  }

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
