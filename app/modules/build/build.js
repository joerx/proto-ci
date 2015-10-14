'use strict';

let EventEmitter = require('events').EventEmitter;
let uniqid = require('uniqid');
let logger = require('winston');

// options = {
//   projectId: uniqid(),
//   gitUrl: 'https://github.com/joerx/express-static.git',
//   gitBranch: 'master',
//   testCmd: 'ls -hal src/',
//   image: 'node:4'
// }
module.exports = function Build(docker, options) {

  let id = uniqid();

  let build = Object.create(EventEmitter.prototype, {
    id: {value: id},
    options: {value: options}
  });

  function handleError(err) {
    if (!err) return;
    build.emit('error', err);
  }

  /**
   * Prepares the container that acts as workspace for this build.
   */
  function prepareWorkspace(done) {

    let cmd = `git clone -v ${options.gitUrl} src`.split(' ');
    let cOptions = {
      cmd: cmd,
      pId: options.projectId,
      image: 'protoci/workspace-base', 
      name: `protoci_${options.projectId}_workspace`
    };

    docker.container.create(cOptions, (err, container) => {
      if (err) return done(err);

      container.on('error', done);
      container.on('start', c => {
        logger.debug('Build %s: workspace created', build.id);
      });

      container.on('exit', c => {
        logger.debug('Build %s: workspace ready', build.id);
        done();
      });

      container.start();
    });
  }

  /**
   * Start the actual build.
   */
  function startBuild(done) {

    let cmd         = options.testCmd.split(' ');
    let image       = options.image || 'node:4';
    let name        = `protoci_${options.projectId}_build`;
    let volumesFrom = [`protoci_${options.projectId}_workspace`];
    let workDir     = '/workspace';
    let cOptions     = {cmd, image, workDir, volumesFrom, name};

    docker.container.create(cOptions, (err, container) => {
      if (err) return done(err);

      container.on('error', done);
      container.on('start', _ => {
        build.emit('start', build);
        logger.debug('Build %s: start build', build.id);
        done();
      });

      container.start();
    });
  }

  build.start = function() {
    logger.debug('Build %s: start', build.id);
    prepareWorkspace(err => {
      if (err) handleError();
      else startBuild(handleError);
    });
  }

  return build;
}
