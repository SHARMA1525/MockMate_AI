const BaseScoringStrategy = require('./BaseScoringStrategy');
const { SCORING } = require('../../utils/constants');

class StrictMatchingStrategy extends BaseScoringStrategy {
  constructor() {
    super();
    this.name = 'strict';
  }

  score(userAnswer, question) {
    const normalizedAnswer = this._normalizeText(userAnswer);
    
    let totalScore = 0;
    let maxScore = 0;
    const matchedKeywords = [];
    const missedKeywords = [];
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

  _matchKeyword(normalizedAnswer, keyword) {
    const normalizedKeyword = keyword.toLowerCase().trim();

    if (normalizedKeyword.includes(' ')) {
      return normalizedAnswer.includes(normalizedKeyword);
    }
    const words = normalizedAnswer.split(' ');
    return words.includes(normalizedKeyword);
  }
}

module.exports = StrictMatchingStrategy;
