const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const Database = require('./config/database');
const Logger = require('./utils/logger');

const UserRepository = require('./repositories/UserRepository');
const QuestionRepository = require('./repositories/QuestionRepository');
const InterviewRepository = require('./repositories/InterviewRepository');
const AnswerRepository = require('./repositories/AnswerRepository');
const ScoreReportRepository = require('./repositories/ScoreReportRepository');

const AuthService = require('./services/AuthService');
const QuestionService = require('./services/QuestionService');
const InterviewService = require('./services/InterviewService');
const EvaluationService = require('./services/EvaluationService');
const StrictMatchingStrategy = require('./services/scoring/StrictMatchingStrategy');

const AuthController = require('./controllers/AuthController');
const InterviewController = require('./controllers/InterviewController');
const QuestionController = require('./controllers/QuestionController');
const AdminController = require('./controllers/AdminController');

const createAuthRoutes = require('./routes/authRoutes');
const createInterviewRoutes = require('./routes/interviewRoutes');
const createQuestionRoutes = require('./routes/questionRoutes');
const createAdminRoutes = require('./routes/adminRoutes');

const errorMiddleware = require('./middleware/errorMiddleware');

const logger = new Logger('Server');

async function startServer() {

  const database = Database.getInstance();
  await database.connect();
  const userRepository = new UserRepository();
  const questionRepository = new QuestionRepository();
  const interviewRepository = new InterviewRepository();
  const answerRepository = new AnswerRepository();
  const scoreReportRepository = new ScoreReportRepository();

  const authService = new AuthService(userRepository);
  const questionService = new QuestionService(questionRepository);

  const scoringStrategy = new StrictMatchingStrategy();
  const evaluationService = new EvaluationService(scoringStrategy);

  const interviewService = new InterviewService(
    interviewRepository,
    questionRepository,
    answerRepository,
    scoreReportRepository,
    evaluationService
  );
  const authController = new AuthController(authService);
  const interviewController = new InterviewController(interviewService);
  const questionController = new QuestionController(questionService);
  const adminController = new AdminController(
    userRepository,
    interviewRepository,
    scoreReportRepository
  );
  const app = express();

  const allowedOrigins = config.corsOrigin.split(',').map(o => o.trim().replace(/\/$/, ''));
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));

  app.use(express.json()); 

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

  app.use('/api/auth', createAuthRoutes(authController));
  app.use('/api/interviews', createInterviewRoutes(interviewController));
  app.use('/api/questions', createQuestionRoutes(questionController));
  app.use('/api/admin', createAdminRoutes(adminController));

  app.use(errorMiddleware);

  const PORT = config.port;
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
  });

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

startServer().catch((error) => {
  logger.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
