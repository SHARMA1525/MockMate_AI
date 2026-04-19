
class BaseScoringStrategy {
  constructor() {
    if (new.target === BaseScoringStrategy) {
      throw new Error('BaseScoringStrategy is abstract. Use a concrete strategy like StrictMatchingStrategy.');
    }

    this.name = 'base';
  }

  score(userAnswer, question) {
    throw new Error('score() method must be implemented by subclass');
  }

  _normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') 
      .replace(/\s+/g, ' ')      
      .trim();
  }

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
