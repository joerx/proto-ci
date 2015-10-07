'use strict';

let EventEmitter = require('events').EventEmitter;
let Build = require('./build');

module.exports = function(docker) {

  let self = Object.create(EventEmitter.prototype);

  self.createBuild = function(options) {
    return Build(docker, options);
  }

  return self; 
}
