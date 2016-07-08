'use strict';

let Log = require('winston');

module.exports = function EventHandler(buildSvc, docker, repo) {

  buildSvc.on('build:start', build => {
    repo.put(build);
  });

  // set status at pci:c:$containerId
  docker.on('container:die', container => {
    // let build = bui
  });
}
