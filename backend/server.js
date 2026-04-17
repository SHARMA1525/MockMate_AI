/**
 * Server Entry Point
 * 
 * This is where everything comes together.
 * 
 * DEPENDENCY INJECTION WIRING:
 * We manually create all instances here and inject dependencies.
 * This gives us full control over object lifecycle and makes
 * the dependency graph visible in one place.
 * 
 * STARTUP SEQUENCE:
 * 1. Connect to MongoDB (Singleton)
 * 2. Create Repositories
 * 3. Create Services (inject repositories)
 * 4. Create Controllers (inject services)
 * 5. Create Routes (inject controllers)
 * 6. Mount middleware and routes on Express
 * 7. Start the server
 */

const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const Database = require('./config/database');
const Logger = require('./utils/logger');

// --- Import Repositories ---
const UserRepository = require('./repositories/UserRepository');
const QuestionRepository = require('./repositories/QuestionRepository');
const InterviewRepository = require('./repositories/InterviewRepository');
const AnswerRepository = require('./repositories/AnswerRepository');
const ScoreReportRepository = require('./repositories/ScoreReportRepository');

// --- Import Services ---
const AuthService = require('./services/AuthService');
const QuestionService = require('./services/QuestionService');
const InterviewService = require('./services/InterviewService');
const EvaluationService = require('./services/EvaluationService');
const StrictMatchingStrategy = require('./services/scoring/StrictMatchingStrategy');

// --- Import Controllers ---
const AuthController = require('./controllers/AuthController');
const InterviewController = require('./controllers/InterviewController');
const QuestionController = require('./controllers/QuestionController');
const AdminController = require('./controllers/AdminController');

// --- Import Route Factories ---
const createAuthRoutes = require('./routes/authRoutes');
const createInterviewRoutes = require('./routes/interviewRoutes');
const createQuestionRoutes = require('./routes/questionRoutes');
const createAdminRoutes = require('./routes/adminRoutes');

// --- Import Middleware ---
const errorMiddleware = require('./middleware/errorMiddleware');

const logger = new Logger('Server');

/**
 * Initialize and start the application
 */
async function startServer() {
  // ============================================
  // STEP 1: Connect to Database (Singleton)
  // ============================================
  const database = Database.getInstance();
  await database.connect();

  // ============================================
  // STEP 2: Create Repository Instances
  // ============================================
  const userRepository = new UserRepository();
  const questionRepository = new QuestionRepository();
  const interviewRepository = new InterviewRepository();
  const answerRepository = new AnswerRepository();
  const scoreReportRepository = new ScoreReportRepository();

  // ============================================
  // STEP 3: Create Service Instances
  //         (Inject repositories as dependencies)
  // ============================================
  const authService = new AuthService(userRepository);
  const questionService = new QuestionService(questionRepository);

  // Create the scoring strategy (Strategy Pattern)
  // Change this to FuzzyMatchingStrategy for typo-tolerant scoring
  const scoringStrategy = new StrictMatchingStrategy();
  const evaluationService = new EvaluationService(scoringStrategy);

  const interviewService = new InterviewService(
    interviewRepository,
    questionRepository,
    answerRepository,
    scoreReportRepository,
    evaluationService
  );

  // ============================================
  // STEP 4: Create Controller Instances
  //         (Inject services as dependencies)
  // ============================================
  const authController = new AuthController(authService);
  const interviewController = new InterviewController(interviewService);
  const questionController = new QuestionController(questionService);
  const adminController = new AdminController(
    userRepository,
    interviewRepository,
    scoreReportRepository
  );

  // ============================================
  // STEP 5: Setup Express App
  // ============================================
  const app = express();

  // --- Global Middleware ---
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json()); // Parse JSON request bodies

  // --- API Info Route ---
  app.get('/api', (req, res) => {
    res.json({
      success: true,
      message: 'MockMate AI - Interview Simulation Platform API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        interviews: '/api/interviews',
        questions: '/api/questions',
        admin: '/api/admin',
      },
    });
  });

  // --- Mount Route Groups ---
  app.use('/api/auth', createAuthRoutes(authController));
  app.use('/api/interviews', createInterviewRoutes(interviewController));
  app.use('/api/questions', createQuestionRoutes(questionController));
  app.use('/api/admin', createAdminRoutes(adminController));

  // --- Global Error Handler (must be LAST middleware) ---
  app.use(errorMiddleware);

  // ============================================
  // STEP 6: Start the Server
  // ============================================
  const PORT = config.port;
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
  });

  // --- Graceful Shutdown ---
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    await database.disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    await database.disconnect();
    process.exit(0);
  });
}

// Start the application
startServer().catch((error) => {
  logger.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
