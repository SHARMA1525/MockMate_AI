/**
 * Scoring Strategy Tests
 * 
 * Tests both StrictMatchingStrategy and FuzzyMatchingStrategy.
 * These tests verify the core scoring algorithm works correctly.
 */

const StrictMatchingStrategy = require('../services/scoring/StrictMatchingStrategy');
const FuzzyMatchingStrategy = require('../services/scoring/FuzzyMatchingStrategy');

// Sample question used in all tests
const sampleQuestion = {
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
};

describe('StrictMatchingStrategy', () => {
  let strategy;

  beforeEach(() => {
    strategy = new StrictMatchingStrategy();
  });

  test('should have name "strict"', () => {
    expect(strategy.name).toBe('strict');
  });

  test('should match all keywords in a perfect answer', () => {
    const answer = 'A closure is a function that remembers its lexical scope and can access a variable from the outer function.';
    const result = strategy.score(answer, sampleQuestion);

    expect(result.matchedKeywords).toContain('closure');
    expect(result.matchedKeywords).toContain('function');
    expect(result.matchedKeywords).toContain('scope');
    expect(result.matchedKeywords).toContain('lexical');
    expect(result.matchedKeywords).toContain('variable');
    expect(result.score).toBeGreaterThan(15); // Close to max 20
  });

  test('should give low score for a poor answer', () => {
    const answer = 'I am not sure about this topic.';
    const result = strategy.score(answer, sampleQuestion);

    expect(result.matchedKeywords.length).toBe(0);
    expect(result.missedKeywords.length).toBeGreaterThan(0);
    expect(result.score).toBe(0);
  });

  test('should be case-insensitive', () => {
    const answer = 'A CLOSURE is a FUNCTION that uses SCOPE.';
    const result = strategy.score(answer, sampleQuestion);

    expect(result.matchedKeywords).toContain('closure');
    expect(result.matchedKeywords).toContain('function');
    expect(result.matchedKeywords).toContain('scope');
  });

  test('should provide feedback for partial answers', () => {
    const answer = 'A closure is related to functions.';
    const result = strategy.score(answer, sampleQuestion);

    expect(result.feedback).toBeTruthy();
    expect(result.missedKeywords).toContain('scope');
  });

  test('should return maxScore of 20', () => {
    const answer = 'Any answer here.';
    const result = strategy.score(answer, sampleQuestion);

    expect(result.maxScore).toBe(20);
  });
});

describe('FuzzyMatchingStrategy', () => {
  let strategy;

  beforeEach(() => {
    strategy = new FuzzyMatchingStrategy();
  });

  test('should have name "fuzzy"', () => {
    expect(strategy.name).toBe('fuzzy');
  });

  test('should match exact keywords', () => {
    const answer = 'A closure is a function with scope access.';
    const result = strategy.score(answer, sampleQuestion);

    expect(result.matchedKeywords).toContain('closure');
    expect(result.matchedKeywords).toContain('function');
    expect(result.matchedKeywords).toContain('scope');
  });

  test('should tolerate minor typos', () => {
    const answer = 'A clousre is a functon with scop access.';
    const result = strategy.score(answer, sampleQuestion);

    // Fuzzy matching should catch at least some typos
    expect(result.matchedKeywords.length).toBeGreaterThan(0);
  });

  test('should not match completely different words', () => {
    const answer = 'The weather is nice today. I like pizza.';
    const result = strategy.score(answer, sampleQuestion);

    expect(result.matchedKeywords.length).toBe(0);
    expect(result.score).toBe(0);
  });

  test('should give same maxScore as strict strategy', () => {
    const answer = 'test answer';
    const result = strategy.score(answer, sampleQuestion);

    expect(result.maxScore).toBe(20);
  });
});

describe('Strategy Comparison', () => {
  test('fuzzy should be more lenient than strict on typos', () => {
    const strict = new StrictMatchingStrategy();
    const fuzzy = new FuzzyMatchingStrategy();

    const answerWithTypos = 'A clousre is a functon that remembers its scop.';

    const strictResult = strict.score(answerWithTypos, sampleQuestion);
    const fuzzyResult = fuzzy.score(answerWithTypos, sampleQuestion);

    // Fuzzy should match same or more keywords
    expect(fuzzyResult.matchedKeywords.length).toBeGreaterThanOrEqual(
      strictResult.matchedKeywords.length
    );
  });
});
