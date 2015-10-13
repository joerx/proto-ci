'use strict';

let DockerAgent = require('./agent');
let monitor = require('./monitor');
let ContainerService = require('./container-service');
let EventEmitter = require('events').EventEmitter;

/**
 * Docker management API
 */
module.exports = function Docker(config) {
  
  let docker = Object.create(EventEmitter.prototype);

  docker.agent = DockerAgent(config);
  docker.containerSvc = ContainerService(docker.agent);
  
  monitor(docker.agent, docker);
  
  return docker;
}
