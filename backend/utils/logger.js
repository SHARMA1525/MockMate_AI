/**
 * Logger Utility
 * 
 * A simple, readable logging class that adds timestamps and
 * context labels to console output. Each module creates its
 * own Logger instance with a label (e.g., "AuthService").
 * 
 * Example usage:
 *   const logger = new Logger('AuthService');
 *   logger.info('User registered successfully');
 *   // Output: [2024-01-15 10:30:45] [INFO] [AuthService] User registered successfully
 */

class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  /**
   * Get formatted timestamp for log messages
   */
  _getTimestamp() {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
  }

  /**
   * Format the log message with timestamp, level, and context
   */
  _formatMessage(level, message) {
    return `[${this._getTimestamp()}] [${level}] [${this.context}] ${message}`;
  }

  /** Log informational messages */
  info(message) {
    console.log(this._formatMessage('INFO', message));
  }

  /** Log warning messages */
  warn(message) {
    console.warn(this._formatMessage('WARN', message));
  }

  /** Log error messages */
  error(message) {
    console.error(this._formatMessage('ERROR', message));
  }

  /** Log debug messages — only in development */
  debug(message) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this._formatMessage('DEBUG', message));
    }
  }
}

module.exports = Logger;
