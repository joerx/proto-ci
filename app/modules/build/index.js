'use strict';

let EventEmitter = require('events').EventEmitter;
let uniqid = require('uniqid');

function short(id, len) {
  len = len || 6;
  if (id.length <= len) return id;
  else return id.substring(0, len) + '...';
}

// TODO: 
// - clean up '*-build' containers after build
// - add build-ids (not just project ids)
// - add project service, UI to set up my own builds
// - have builds triggered by webhooks
// - workspace might belong to project, not to build
// - workspace requires more complex logic, find a way to inject a script into the container
//   (likely via a volume...)
module.exports = function Build(opts, docker) {

  let options = {
    projectId: uniqid(),
    gitUrl: 'https://github.com/joerx/express-static.git',
    gitBranch: 'master',
    testCmd: 'npm test',
    image: 'node:4'
  }

  let build = Object.create(EventEmitter.prototype);

  function handleError(err) {
    if (!err) return;
    build.emit('error', err);
  }

  function prepareWorkspace(done) {
    // let cmd = `git clone ${options.gitUrl} src`.split(' ');
    let cmd = 'mkdir src'.split(' ');

    docker.Container.create({
      pId: options.projectId,
      image: 'protoci/workspace-base', 
      cmd: cmd,
      name: `protoci_${options.projectId}_workspace`
    }, (err, container) => {
      if (err) return done(err);

      // emit start workspace event
      container.on('start', c => {
        build.emit('workspace-init', c);
      });

      // check exit code, if != 0, cancel build and emit workspace-failed event
      container.on('exit', c => {
        if (c.exitCode !== 0) done(Error(`Workspace setup failed (${e.exitCode})`));
        else build.emit('workspace-complete', c)
      });

      // start workspace setup and move on
      container.start(done);
    });
  }

  // start build. note that callback will not necessarily be invoked after the build completes,
  // only after the container for the build has successfully started, i.e. it may not wait for 
  // the container to stop. Listen for the 'complete' event instead.
  function startBuild(done) {
    let cmd = options.testCmd;

    docker.Container.create({
      image: 'node:4',
      cmd: 'ls'.split(' '),
      workDir: '/workspace/src',
      volumesFrom: [`protoci_${options.projectId}_workspace`],
      name: `protoci_${options.projectId}_build`
    }, (err, container) => {
      if (err) done(err);
      else {
        // emit 'build-start' event
        container.on('start', c => build.emit('build-start', build));

        // evaluate build result, emit 'success' or 'failure' events
        container.on('exit', c => {
          build.exitCode = c.exitCode;
          build.emit('build-complete', build);
          build.emit('complete', build);
          build.emit(c.exitCode == 0 ? 'success' : 'failure', build);
        });

        // start the bloody thing
        container.start(err => {
          if (err) done(err);
          else done();
        });
      }
    });
  }

  build.start = function() {
    build.emit('start', options);
    prepareWorkspace(err => {
      if (err) handleError();
      else startBuild(handleError);
    });
  }

  return build;
}
