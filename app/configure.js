'use strict';

let assert = require('assert');

assert(process.env.DOCKER_HOST, 'DOCKER_HOST is required');
assert(process.env.DOCKER_CERT_PATH, 'DOCKER_CERT_PATH is required');

let config = module.exports = {
  docker: {
    host: process.env.DOCKER_HOST,
    certsPath: process.env.DOCKER_CERT_PATH
  },
  logLevel: process.env.LOG_LEVEL || 'debug'
}
