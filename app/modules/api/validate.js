'use strict';

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

module.exports = function validate(condition, msg) {
  msg = msg || 'Validation Error';
  if (!condition) throw new ValidationError(msg);
}
