'use strict';

let BuildService = require('./build-service');
let EventHandler = require('./event-handler');
let BuildRepo = require('./build-repo');

module.exports = function(docker) {

  let buildSvc = BuildService(docker);
  let buildRepo = BuildRepo();
  let eventHandler = EventHandler(buildSvc, docker, buildRepo);

  return {
    createBuild: buildSvc.createBuild,
    findAll: buildRepo.index
  };
}
