'use strict';

let logger = require('winston');
let DockerAgent = require('./agent');
let monitor = require('./monitor');
let ContainerService = require('./container-service');
let EventEmitter = require('events').EventEmitter;

let containerEvents = [
  'attach',
  'commit', 
  'copy', 
  'create', 
  'destroy',
  'die',
  'exec_create',
  'exec_start',
  'export',
  'kill',
  'oom',
  'pause',
  'rename',
  'resize',
  'restart',
  'start',
  'stop',
  'top',
  'unpause'
];

/**
 * Docker management API
 */
module.exports = function Docker(config) {
  
  let docker = Object.create(EventEmitter.prototype);

  docker.agent = DockerAgent(config);
  docker.container = ContainerService(docker.agent);
  
  monitor(docker.agent, docker);

  containerEvents.forEach(name => docker.on(`container:${name}`, ev => {
    logger.debug('Docker: container %s', name);
  }));
  
  return docker;
}
