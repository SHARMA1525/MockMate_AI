/**
 * Factory Pattern - Response & Error Factories
 * 
 * DESIGN PATTERN: Factory
 * Instead of manually crafting response objects everywhere,
 * we use factory methods to create consistent, standardized objects.
 * 
 * BENEFITS:
 * - Every API response has the same shape
 * - Error objects always include status codes
 * - Easy to change the format in one place
 */

const { HTTP_STATUS } = require('./constants');

/**
 * Creates standardized API response objects.
 * 
 * Every response from our API will look like:
 * {
 *   success: true/false,
 *   message: "Human-readable message",
 *   data: { ... actual data ... }
 * }
 */
class ResponseFactory {
  /**
   * Create a success response
   * @param {Object} data - The data to send back
   * @param {string} message - Success message
   * @returns {Object} Standardized success response
   */
  static success(data, message = 'Success') {
    return {
      success: true,
      message,
      data,
    };
  }

  /**
   * Create an error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @returns {Object} Standardized error response
   */
  static error(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    return {
      success: false,
      message,
      data: null,
    };
  }
}

/**
 * Creates custom error objects with HTTP status codes.
 * These errors travel through Express middleware until
 * they reach our global error handler.
 */
class ErrorFactory {
  /**
   * Create a custom error with a status code
   * @param {string} message - Error description
   * @param {number} statusCode - HTTP status code
   * @returns {Error} Error object with statusCode property
   */
  static createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  // Convenience methods for common error types
  static badRequest(message = 'Bad Request') {
    return this.createError(message, HTTP_STATUS.BAD_REQUEST);
  }

  static unauthorized(message = 'Unauthorized') {
    return this.createError(message, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(message = 'Forbidden') {
    return this.createError(message, HTTP_STATUS.FORBIDDEN);
  }

  static notFound(message = 'Resource not found') {
    return this.createError(message, HTTP_STATUS.NOT_FOUND);
  }

  static conflict(message = 'Resource already exists') {
    return this.createError(message, HTTP_STATUS.CONFLICT);
  }
}

module.exports = { ResponseFactory, ErrorFactory };
