const BaseScoringStrategy = require('./BaseScoringStrategy');
const { SCORING } = require('../../utils/constants');

class FuzzyMatchingStrategy extends BaseScoringStrategy {
  constructor() {
    super();
    this.name = 'fuzzy';
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

      if (this._fuzzyMatchKeyword(normalizedAnswer, keywordObj.keyword)) {
        totalScore += keywordWeight;
        matchedKeywords.push(keywordObj.keyword);
      } else {
        missedKeywords.push(keywordObj.keyword);
      }
    }

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


  _fuzzyMatchKeyword(normalizedAnswer, keyword) {
    const normalizedKeyword = keyword.toLowerCase().trim();

    if (normalizedAnswer.includes(normalizedKeyword)) {
      return true;
    }

    const words = normalizedAnswer.split(' ');

    for (const word of words) {
      const similarity = this._calculateSimilarity(word, normalizedKeyword);
      if (similarity >= SCORING.FUZZY_MATCH_THRESHOLD) {
        return true;
      }
    }

    return false;
  }

  _calculateSimilarity(str1, str2) {
    if (str1.length < 2 || str2.length < 2) {
      return str1 === str2 ? 1 : 0;
    }

    const bigrams1 = this._getBigrams(str1);
    const bigrams2 = this._getBigrams(str2);

    let commonCount = 0;
    const bigrams2Copy = [...bigrams2]

    for (const bigram of bigrams1) {
      const index = bigrams2Copy.indexOf(bigram);
      if (index !== -1) {
        commonCount++;
        bigrams2Copy.splice(index, 1); 
      }
    }

    const totalBigrams = bigrams1.length + bigrams2.length;
    return (2 * commonCount) / totalBigrams;
  }

  _getBigrams(str) {
    const bigrams = [];
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.push(str.substring(i, i + 2));
    }
    return bigrams;
  }
}

module.exports = FuzzyMatchingStrategy;
