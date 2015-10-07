'use strict';

module.exports = function(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'doh!';
  let stack = err.stack || '';

  res.status(statusCode).json({
    message: message,
    stack: stack
  });
}
