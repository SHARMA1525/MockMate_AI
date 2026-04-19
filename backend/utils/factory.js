const { HTTP_STATUS } = require('./constants');


class ResponseFactory {
 
  static success(data, message = 'Success') {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    return {
      success: false,
      message,
      data: null,
    };
  }
}

class ErrorFactory {

  static createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

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
