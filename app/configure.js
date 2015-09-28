'use strict';

if (!process.env.DOCKER_HOST) throw Error('DOCKER_HOST is required');
if (!process.env.DOCKER_CERTS_PATH) throw Error('DOCKER_CERTS_PATH is required');

let config = module.exports = {
  docker: {
    host: process.env.DOCKER_HOST,
    certsPath: process.env.DOCKER_CERTS_PATH
  }
}
