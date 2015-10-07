'use strict';

let EventEmitter = require('events').EventEmitter;
let uniqid = require('uniqid');
let logger = require('winston');

// TODO: 
// - clean up '*-build' containers after build
// - add build-ids (not just project ids)
// - add project service, UI to set up my own builds
// - have builds triggered by webhooks
// - workspace might belong to project, not to build
// - workspace requires more complex logic, find a way to inject a script into the container
//   (likely via a volume...)
module.exports = function Build(docker, options) {

  // options = {
  //   projectId: uniqid(),
  //   gitUrl: 'https://github.com/joerx/express-static.git',
  //   gitBranch: 'master',
  //   testCmd: 'ls -hal src/',
  //   image: 'node:4'
  // }

  let build = Object.create(EventEmitter.prototype, {
    id: {value: uniqid()},
    options: {value: options}
  });

  function handleError(err) {
    if (!err) return;
    build.emit('error', err);
  }

  function prepareWorkspace(done) {

    logger.debug('build %s - creating workspace', build.id);

    let cmd = `git clone -v ${options.gitUrl} src`.split(' ');
    // let cmd = 'mkdir src'.split(' ');

    docker.container.create({
      pId: options.projectId,
      image: 'protoci/workspace-base', 
      cmd: cmd,
      name: `protoci_${options.projectId}_workspace`
    }, (err, container) => {
      if (err) return done(err);

      // emit start workspace event
      container.on('start', c => {
        logger.debug('build %s - workspace started', build.id);
        build.emit('workspace-init', c);
      });

      // check exit code, if != 0, cancel build and emit workspace-failed event
      container.on('exit', c => {
        logger.debug('build %s - workspace exited with code %s', build.id, c.exitCode);
        if (c.exitCode !== 0) done(Error(`Workspace setup failed (${c.exitCode})`));
        else {
          build.emit('workspace-complete', c);
          done();
        }
      });

      // start workspace setup and move on
      container.start(err => {
        if (err) done(err);
      });
    });
  }

  // start build. note that callback will not necessarily be invoked after the build completes,
  // only after the container for the build has successfully started - that is, it may not wait for 
  // the container to stop. Listen for the 'complete' event instead.
  function startBuild(done) {

    let cOptions = {
      image: 'node:4',
      cmd: options.testCmd.split(' '),
      workDir: '/workspace',
      volumesFrom: [`protoci_${options.projectId}_workspace`],
      name: `protoci_${options.projectId}_build`
    }

    logger.debug('build %s - starting build with cmd \'%s\'', build.id, options.testCmd);

    docker.container.create(cOptions, (err, container) => {
      if (err) done(err);
      else {
        // emit 'build-start' event
        container.on('start', c => build.emit('build-start', build));

        // evaluate build result, emit 'success' or 'failure' events
        container.on('exit', c => {

          logger.debug('build %s - build exited with code %s', build.id, c.exitCode);

          build.exitCode = c.exitCode;
          
          build.emit('complete', build);
          build.emit(c.exitCode == 0 ? 'success' : 'failure', build);
        });

        // start the bloody thing, don't wait for the result
        container.start(err => {
          if (err) done(err);
          else done();
        });
      }
    });
  }

  build.start = function() {
    build.emit('start', build);
    logger.debug('start build %s', build.id);

    prepareWorkspace(err => {
      if (err) handleError();
      else startBuild(handleError);
    });
  }

  return build;
}
