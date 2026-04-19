const Logger = require('../utils/logger');
const { HTTP_STATUS } = require('../utils/constants');

const logger = new Logger('ErrorHandler');
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message} - ${req.method} ${req.originalUrl}`);
    if (process.env.NODE_ENV !== 'production') {
      logger.error(err.stack);
    }
  } else {
    logger.warn(`${statusCode} - ${message} - ${req.method} ${req.originalUrl}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
