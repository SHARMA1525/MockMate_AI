const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

const SESSION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
  CANCELLED: 'cancelled'
};

const CATEGORIES = {
  JAVASCRIPT: 'JavaScript',
  REACT: 'React',
  NODE_JS: 'Node.js',
  SYSTEM_DESIGN: 'System Design',
  DATA_STRUCTURES: 'Data Structures',
};

const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

const SCORING = {
  QUESTIONS_PER_SESSION: 5,     
  MAX_SCORE_PER_QUESTION: 20,      
  TOTAL_MAX_SCORE: 100,            
  REQUIRED_KEYWORD_WEIGHT: 2,      
  BONUS_KEYWORD_WEIGHT: 1,         
  FUZZY_MATCH_THRESHOLD: 0.75,     
};

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
