/**
 * Application Constants
 * 
 * All "magic strings" and configuration values live here.
 * This prevents typos and makes the codebase easier to maintain.
 * 
 * If you need to change a role name or add a new category,
 * you only update it in this file.
 */

// User roles for RBAC (Role-Based Access Control)
const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Interview session statuses
const SESSION_STATUS = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
};

// Available interview categories
const CATEGORIES = {
  JAVASCRIPT: 'JavaScript',
  REACT: 'React',
  NODE_JS: 'Node.js',
  SYSTEM_DESIGN: 'System Design',
  DATA_STRUCTURES: 'Data Structures',
};

// Question difficulty levels
const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

// Scoring configuration
const SCORING = {
  QUESTIONS_PER_SESSION: 5,        // Number of questions per interview
  MAX_SCORE_PER_QUESTION: 20,      // Each question is worth 20 points
  TOTAL_MAX_SCORE: 100,            // 5 questions × 20 = 100 total
  REQUIRED_KEYWORD_WEIGHT: 2,      // Required keywords are worth more
  BONUS_KEYWORD_WEIGHT: 1,         // Bonus keywords are worth less
  FUZZY_MATCH_THRESHOLD: 0.75,     // Minimum similarity for fuzzy matching (0-1)
};

// HTTP Status Codes - for readability
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

module.exports = {
  ROLES,
  SESSION_STATUS,
  CATEGORIES,
  DIFFICULTY,
  SCORING,
  HTTP_STATUS,
};
