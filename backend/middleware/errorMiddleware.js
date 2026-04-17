/**
 * Global Error Handling Middleware
 * 
 * DESIGN PATTERN: Middleware Pattern
 * 
 * This is the LAST middleware in the Express pipeline.
 * It catches ALL errors thrown by controllers, services,
 * and other middleware, and returns a standardized JSON response.
 * 
 * WHY CENTRALIZED ERROR HANDLING?
 * - Consistent error response format across all endpoints
 * - No try-catch blocks needed in every route handler
 * - One place to add error logging, monitoring, etc.
 * 
 * HOW IT WORKS:
 * When any middleware or route handler calls next(error),
 * Express skips all remaining route handlers and jumps
 * directly to this error handler (because it has 4 parameters).
 */

const Logger = require('../utils/logger');
const { HTTP_STATUS } = require('../utils/constants');

const logger = new Logger('ErrorHandler');

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  // Default to 500 if no status code was set
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  // Log the error for debugging
  if (statusCode >= 500) {
    // Server errors — log full details
    logger.error(`${statusCode} - ${message} - ${req.method} ${req.originalUrl}`);
    if (process.env.NODE_ENV !== 'production') {
      logger.error(err.stack);
    }
  } else {
    // Client errors (4xx) — just log a brief message
    logger.warn(`${statusCode} - ${message} - ${req.method} ${req.originalUrl}`);
  }

  // Send standardized error response
  res.status(statusCode).json({
    success: false,
    message,
    // Only include stack trace in development (never in production)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
