/**
 * Interview Flow Tests
 * 
 * Tests the EvaluationService which ties together
 * the scoring strategies with the answer evaluation pipeline.
 */

const EvaluationService = require('../services/EvaluationService');
const StrictMatchingStrategy = require('../services/scoring/StrictMatchingStrategy');
const FuzzyMatchingStrategy = require('../services/scoring/FuzzyMatchingStrategy');

// Mock answer data (simulating populated MongoDB documents)
const mockAnswers = [
  {
    _id: 'a1',
    sessionId: 's1',
    userAnswer: 'A closure is a function that has access to the outer scope and lexical environment. Variables from the outer function are preserved.',
    questionId: {
      _id: 'q1',
      content: 'What is a closure?',
      requiredKeywords: [
        { keyword: 'closure', weight: 2 },
        { keyword: 'function', weight: 2 },
        { keyword: 'scope', weight: 2 },
      ],
      bonusKeywords: [
        { keyword: 'lexical', weight: 1 },
        { keyword: 'variable', weight: 1 },
      ],
    },
  },
  {
    _id: 'a2',
    sessionId: 's1',
    userAnswer: 'I think it has something to do with programming. Not really sure.',
    questionId: {
      _id: 'q2',
      content: 'Explain the event loop.',
      requiredKeywords: [
        { keyword: 'event loop', weight: 2 },
        { keyword: 'call stack', weight: 2 },
        { keyword: 'callback queue', weight: 2 },
      ],
      bonusKeywords: [
        { keyword: 'asynchronous', weight: 1 },
      ],
    },
  },
];

describe('EvaluationService', () => {
  let evaluationService;

  beforeEach(() => {
    const strategy = new StrictMatchingStrategy();
    evaluationService = new EvaluationService(strategy);
  });

  test('should evaluate all answers and return results', () => {
    const results = evaluationService.evaluateAnswers(mockAnswers);

    expect(results).toHaveProperty('totalScore');
    expect(results).toHaveProperty('maxPossibleScore');
    expect(results).toHaveProperty('questionResults');
    expect(results).toHaveProperty('overallFeedback');
    expect(results.questionResults).toHaveLength(2);
  });

  test('should give higher score to good answers', () => {
    const results = evaluationService.evaluateAnswers(mockAnswers);

    // First answer (good) should score higher than second (poor)
    const [goodResult, poorResult] = results.questionResults;
    expect(goodResult.score).toBeGreaterThan(poorResult.score);
  });

  test('should include matched and missed keywords', () => {
    const results = evaluationService.evaluateAnswers(mockAnswers);
    const firstResult = results.questionResults[0];

    expect(firstResult.matchedKeywords).toBeDefined();
    expect(firstResult.missedKeywords).toBeDefined();
    expect(Array.isArray(firstResult.matchedKeywords)).toBe(true);
  });

  test('should generate overall feedback', () => {
    const results = evaluationService.evaluateAnswers(mockAnswers);

    expect(results.overallFeedback).toBeTruthy();
    expect(typeof results.overallFeedback).toBe('string');
  });

  test('should calculate maxPossibleScore correctly', () => {
    const results = evaluationService.evaluateAnswers(mockAnswers);

    // Each question has maxScore of 20, so 2 questions = 40
    expect(results.maxPossibleScore).toBe(40);
  });

  test('should allow strategy switching', () => {
    const strictResults = evaluationService.evaluateAnswers(mockAnswers);

    // Switch to fuzzy strategy
    evaluationService.setStrategy(new FuzzyMatchingStrategy());
    const fuzzyResults = evaluationService.evaluateAnswers(mockAnswers);

    // Both should produce valid results (may differ in scores)
    expect(strictResults.questionResults).toHaveLength(2);
    expect(fuzzyResults.questionResults).toHaveLength(2);
  });
});
