'use strict';

let BuildService = require('./build-service');
// let EventHandler = require('./event-handler');

module.exports = function(docker) {

  let buildSvc = BuildService(docker);
  // let eventHandler = EventHandler(docker);

  return buildSvc;
}
