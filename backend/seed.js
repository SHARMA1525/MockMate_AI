/**
 * Database Seeder
 * 
 * Populates the database with sample data for testing and demo.
 * Run: npm run seed
 * 
 * Creates:
 * - 1 admin user (admin@mockmate.com / admin123)
 * - 1 regular user (john@example.com / user123)
 * - 25 sample interview questions across 5 categories
 */

const mongoose = require('mongoose');
const config = require('./config/env');
const User = require('./models/User');
const Question = require('./models/Question');
const Logger = require('./utils/logger');

const logger = new Logger('Seeder');

// ============================================
// Sample Users
// ============================================
const users = [
  {
    username: 'admin',
    email: 'admin@mockmate.com',
    passwordHash: 'admin123',  // Will be hashed by pre-save hook
    role: 'admin',
  },
  {
    username: 'john_doe',
    email: 'john@example.com',
    passwordHash: 'user123',
    role: 'user',
  },
];

// ============================================
// Sample Questions (5 per category)
// ============================================
const questions = [
  // --- JavaScript Questions ---
  {
    category: 'JavaScript',
    content: 'What is a closure in JavaScript? Explain with an example.',
    difficulty: 'medium',
    requiredKeywords: [
      { keyword: 'closure', weight: 2 },
      { keyword: 'function', weight: 2 },
      { keyword: 'scope', weight: 2 },
      { keyword: 'lexical', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: 'inner function', weight: 1 },
      { keyword: 'outer function', weight: 1 },
      { keyword: 'variable', weight: 1 },
    ],
  },
  {
    category: 'JavaScript',
    content: 'Explain the difference between var, let, and const.',
    difficulty: 'easy',
    requiredKeywords: [
      { keyword: 'var', weight: 1 },
      { keyword: 'let', weight: 1 },
      { keyword: 'const', weight: 1 },
      { keyword: 'scope', weight: 2 },
      { keyword: 'hoisting', weight: 2 },
    ],
    bonusKeywords: [
      { keyword: 'block scope', weight: 1 },
      { keyword: 'function scope', weight: 1 },
      { keyword: 'reassign', weight: 1 },
    ],
  },
  {
    category: 'JavaScript',
    content: 'What is the event loop in JavaScript? How does it work?',
    difficulty: 'hard',
    requiredKeywords: [
      { keyword: 'event loop', weight: 2 },
      { keyword: 'call stack', weight: 2 },
      { keyword: 'callback queue', weight: 2 },
      { keyword: 'asynchronous', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: 'microtask', weight: 1 },
      { keyword: 'macrotask', weight: 1 },
      { keyword: 'single threaded', weight: 1 },
      { keyword: 'web api', weight: 1 },
    ],
  },
  {
    category: 'JavaScript',
    content: 'What are Promises in JavaScript? How do they handle asynchronous operations?',
    difficulty: 'medium',
    requiredKeywords: [
      { keyword: 'promise', weight: 2 },
      { keyword: 'resolve', weight: 2 },
      { keyword: 'reject', weight: 2 },
      { keyword: 'asynchronous', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: 'then', weight: 1 },
      { keyword: 'catch', weight: 1 },
      { keyword: 'async', weight: 1 },
      { keyword: 'await', weight: 1 },
    ],
  },
  {
    category: 'JavaScript',
    content: 'Explain prototypal inheritance in JavaScript.',
    difficulty: 'hard',
    requiredKeywords: [
      { keyword: 'prototype', weight: 2 },
      { keyword: 'inheritance', weight: 2 },
      { keyword: 'object', weight: 1 },
      { keyword: 'chain', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: '__proto__', weight: 1 },
      { keyword: 'constructor', weight: 1 },
      { keyword: 'class', weight: 1 },
    ],
  },

  // --- React Questions ---
  {
    category: 'React',
    content: 'What is the virtual DOM and how does React use it?',
    difficulty: 'medium',
    requiredKeywords: [
      { keyword: 'virtual dom', weight: 2 },
      { keyword: 'real dom', weight: 1 },
      { keyword: 'reconciliation', weight: 2 },
      { keyword: 'performance', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: 'diffing', weight: 1 },
      { keyword: 'render', weight: 1 },
      { keyword: 'update', weight: 1 },
    ],
  },
  {
    category: 'React',
    content: 'Explain React hooks. What are useState and useEffect?',
    difficulty: 'easy',
    requiredKeywords: [
      { keyword: 'hooks', weight: 2 },
      { keyword: 'usestate', weight: 2 },
      { keyword: 'useeffect', weight: 2 },
      { keyword: 'functional component', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: 'state', weight: 1 },
      { keyword: 'side effect', weight: 1 },
      { keyword: 'lifecycle', weight: 1 },
    ],
  },
  {
    category: 'React',
    content: 'What is the difference between props and state in React?',
    difficulty: 'easy',
    requiredKeywords: [
      { keyword: 'props', weight: 2 },
      { keyword: 'state', weight: 2 },
      { keyword: 'component', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: 'immutable', weight: 1 },
      { keyword: 'parent', weight: 1 },
      { keyword: 'child', weight: 1 },
      { keyword: 'rerender', weight: 1 },
    ],
  },
  {
    category: 'React',
    content: 'What is React Context API and when would you use it?',
    difficulty: 'medium',
    requiredKeywords: [
      { keyword: 'context', weight: 2 },
      { keyword: 'provider', weight: 2 },
      { keyword: 'consumer', weight: 1 },
      { keyword: 'prop drilling', weight: 2 },
    ],
    bonusKeywords: [
      { keyword: 'usecontext', weight: 1 },
      { keyword: 'global state', weight: 1 },
      { keyword: 'theme', weight: 1 },
    ],
  },
  {
    category: 'React',
    content: 'Explain the component lifecycle in React.',
    difficulty: 'medium',
    requiredKeywords: [
      { keyword: 'lifecycle', weight: 2 },
      { keyword: 'mount', weight: 2 },
      { keyword: 'update', weight: 1 },
      { keyword: 'unmount', weight: 2 },
    ],
    bonusKeywords: [
      { keyword: 'componentdidmount', weight: 1 },
      { keyword: 'useeffect', weight: 1 },
      { keyword: 'render', weight: 1 },
    ],
  },

  // --- Node.js Questions ---
  {
    category: 'Node.js',
    content: 'What is Node.js and why is it used for server-side development?',
    difficulty: 'easy',
    requiredKeywords: [
      { keyword: 'javascript', weight: 1 },
      { keyword: 'runtime', weight: 2 },
      { keyword: 'server', weight: 1 },
      { keyword: 'v8', weight: 2 },
    ],
    bonusKeywords: [
      { keyword: 'non-blocking', weight: 1 },
      { keyword: 'event-driven', weight: 1 },
      { keyword: 'npm', weight: 1 },
    ],
  },
  {
    category: 'Node.js',
    content: 'Explain middleware in Express.js. How does it work?',
    difficulty: 'medium',
    requiredKeywords: [
      { keyword: 'middleware', weight: 2 },
      { keyword: 'request', weight: 1 },
      { keyword: 'response', weight: 1 },
      { keyword: 'next', weight: 2 },
    ],
    bonusKeywords: [
      { keyword: 'pipeline', weight: 1 },
      { keyword: 'express', weight: 1 },
      { keyword: 'authentication', weight: 1 },
    ],
  },
  {
    category: 'Node.js',
    content: 'What is the difference between SQL and NoSQL databases?',
    difficulty: 'medium',
    requiredKeywords: [
      { keyword: 'sql', weight: 1 },
      { keyword: 'nosql', weight: 1 },
      { keyword: 'relational', weight: 2 },
      { keyword: 'schema', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: 'mongodb', weight: 1 },
      { keyword: 'table', weight: 1 },
      { keyword: 'document', weight: 1 },
      { keyword: 'scalability', weight: 1 },
    ],
  },
  {
    category: 'Node.js',
    content: 'How does authentication work with JWT tokens?',
    difficulty: 'medium',
    requiredKeywords: [
      { keyword: 'jwt', weight: 2 },
      { keyword: 'token', weight: 2 },
      { keyword: 'authentication', weight: 1 },
      { keyword: 'header', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: 'payload', weight: 1 },
      { keyword: 'signature', weight: 1 },
      { keyword: 'bearer', weight: 1 },
      { keyword: 'secret', weight: 1 },
    ],
  },
  {
    category: 'Node.js',
    content: 'What is the Repository Pattern and why should you use it?',
    difficulty: 'hard',
    requiredKeywords: [
      { keyword: 'repository', weight: 2 },
      { keyword: 'pattern', weight: 1 },
      { keyword: 'data access', weight: 2 },
      { keyword: 'abstraction', weight: 2 },
    ],
    bonusKeywords: [
      { keyword: 'separation of concerns', weight: 1 },
      { keyword: 'testing', weight: 1 },
      { keyword: 'database', weight: 1 },
    ],
  },

  // --- System Design Questions ---
  {
    category: 'System Design',
    content: 'What is a load balancer and why is it important?',
    difficulty: 'medium',
    requiredKeywords: [
      { keyword: 'load balancer', weight: 2 },
      { keyword: 'traffic', weight: 2 },
      { keyword: 'server', weight: 1 },
      { keyword: 'distribute', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: 'round robin', weight: 1 },
      { keyword: 'availability', weight: 1 },
      { keyword: 'scalability', weight: 1 },
    ],
  },
  {
    category: 'System Design',
    content: 'Explain the concept of database indexing. Why is it important?',
    difficulty: 'medium',
    requiredKeywords: [
      { keyword: 'index', weight: 2 },
      { keyword: 'query', weight: 1 },
      { keyword: 'performance', weight: 2 },
      { keyword: 'search', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: 'b-tree', weight: 1 },
      { keyword: 'primary key', weight: 1 },
      { keyword: 'read', weight: 1 },
    ],
  },
  {
    category: 'System Design',
    content: 'What is caching and how does it improve system performance?',
    difficulty: 'medium',
    requiredKeywords: [
      { keyword: 'cache', weight: 2 },
      { keyword: 'memory', weight: 1 },
      { keyword: 'performance', weight: 2 },
      { keyword: 'speed', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: 'redis', weight: 1 },
      { keyword: 'ttl', weight: 1 },
      { keyword: 'invalidation', weight: 1 },
    ],
  },
  {
    category: 'System Design',
    content: 'What are microservices? How do they differ from monolithic architecture?',
    difficulty: 'hard',
    requiredKeywords: [
      { keyword: 'microservices', weight: 2 },
      { keyword: 'monolithic', weight: 2 },
      { keyword: 'independent', weight: 1 },
      { keyword: 'service', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: 'scalability', weight: 1 },
      { keyword: 'deployment', weight: 1 },
      { keyword: 'api', weight: 1 },
      { keyword: 'decoupled', weight: 1 },
    ],
  },
  {
    category: 'System Design',
    content: 'Explain the CAP theorem in distributed systems.',
    difficulty: 'hard',
    requiredKeywords: [
      { keyword: 'cap', weight: 2 },
      { keyword: 'consistency', weight: 2 },
      { keyword: 'availability', weight: 2 },
      { keyword: 'partition tolerance', weight: 2 },
    ],
    bonusKeywords: [
      { keyword: 'distributed', weight: 1 },
      { keyword: 'tradeoff', weight: 1 },
      { keyword: 'network', weight: 1 },
    ],
  },

  // --- Data Structures Questions ---
  {
    category: 'Data Structures',
    content: 'What is the difference between an array and a linked list?',
    difficulty: 'easy',
    requiredKeywords: [
      { keyword: 'array', weight: 2 },
      { keyword: 'linked list', weight: 2 },
      { keyword: 'memory', weight: 1 },
      { keyword: 'access', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: 'contiguous', weight: 1 },
      { keyword: 'pointer', weight: 1 },
      { keyword: 'insertion', weight: 1 },
    ],
  },
  {
    category: 'Data Structures',
    content: 'Explain how a hash table works and its time complexity.',
    difficulty: 'medium',
    requiredKeywords: [
      { keyword: 'hash', weight: 2 },
      { keyword: 'key', weight: 1 },
      { keyword: 'value', weight: 1 },
      { keyword: 'collision', weight: 2 },
    ],
    bonusKeywords: [
      { keyword: 'o(1)', weight: 1 },
      { keyword: 'bucket', weight: 1 },
      { keyword: 'hash function', weight: 1 },
    ],
  },
  {
    category: 'Data Structures',
    content: 'What is a binary search tree (BST)? What are its properties?',
    difficulty: 'medium',
    requiredKeywords: [
      { keyword: 'binary', weight: 1 },
      { keyword: 'tree', weight: 1 },
      { keyword: 'left', weight: 1 },
      { keyword: 'right', weight: 1 },
      { keyword: 'search', weight: 2 },
    ],
    bonusKeywords: [
      { keyword: 'sorted', weight: 1 },
      { keyword: 'node', weight: 1 },
      { keyword: 'o(log n)', weight: 1 },
    ],
  },
  {
    category: 'Data Structures',
    content: 'Explain the difference between a stack and a queue.',
    difficulty: 'easy',
    requiredKeywords: [
      { keyword: 'stack', weight: 2 },
      { keyword: 'queue', weight: 2 },
      { keyword: 'lifo', weight: 2 },
      { keyword: 'fifo', weight: 2 },
    ],
    bonusKeywords: [
      { keyword: 'push', weight: 1 },
      { keyword: 'pop', weight: 1 },
      { keyword: 'enqueue', weight: 1 },
      { keyword: 'dequeue', weight: 1 },
    ],
  },
  {
    category: 'Data Structures',
    content: 'What is a graph data structure? Explain BFS and DFS traversals.',
    difficulty: 'hard',
    requiredKeywords: [
      { keyword: 'graph', weight: 2 },
      { keyword: 'bfs', weight: 2 },
      { keyword: 'dfs', weight: 2 },
      { keyword: 'traversal', weight: 1 },
    ],
    bonusKeywords: [
      { keyword: 'vertex', weight: 1 },
      { keyword: 'edge', weight: 1 },
      { keyword: 'queue', weight: 1 },
      { keyword: 'stack', weight: 1 },
    ],
  },
];

// ============================================
// Main Seed Function
// ============================================
async function seedDatabase() {
  try {
    logger.info('Connecting to database...');
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB');

    // Clear existing data
    logger.info('Clearing existing data...');
    await User.deleteMany({});
    await Question.deleteMany({});

    // Seed users
    logger.info('Seeding users...');
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      logger.info(`  Created user: ${user.email} (${user.role})`);
    }

    // Seed questions
    logger.info('Seeding questions...');
    for (const questionData of questions) {
      const question = new Question(questionData);
      await question.save();
    }
    logger.info(`  Created ${questions.length} questions across 5 categories`);

    logger.info('Seeding completed successfully!');
    logger.info('');
    logger.info('Demo credentials:');
    logger.info('  Admin: admin@mockmate.com / admin123');
    logger.info('  User:  john@example.com / user123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();
