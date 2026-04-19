class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  _getTimestamp() {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
  }

  _formatMessage(level, message) {
    return `[${this._getTimestamp()}] [${level}] [${this.context}] ${message}`;
  }

  info(message) {
    console.log(this._formatMessage('INFO', message));
  }

  warn(message) {
    console.warn(this._formatMessage('WARN', message));
  }

  error(message) {
    console.error(this._formatMessage('ERROR', message));
  }

  debug(message) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this._formatMessage('DEBUG', message));
    }
  }
}

module.exports = Logger;
