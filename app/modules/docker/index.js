'use strict';

let DockerAgent = require('./agent');
let ContainerService = require('./container-service');

/**
 * Docker management API
 */
module.exports = function Docker(config) {
  
  let agent = DockerAgent(config);
  let containerSvc = ContainerService(agent);

  return {
    container: containerSvc,
    agent: agent
  };
}
