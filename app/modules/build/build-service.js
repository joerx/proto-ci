'use strict';

let EventEmitter = require('events').EventEmitter;
let Build = require('./build');

module.exports = function BuildService(docker) {

  let self = Object.create(EventEmitter.prototype);

  self.createBuild = function(options) {
    let build = Build(docker, options);
    build.on('start', build => self.emit('build:start', build));
    return build;
  }

  return self; 
}
