'use strict';

let Build = require('./app/modules/build');
let Docker = require('./app/modules/docker');
let config = require('./app/configure');

let docker = Docker(config.docker);
let build = Build({}, docker);

build.on('error', e => console.error('Build error', e));
build.on('start', () => console.log('build started'));
build.on('success', b => console.log(`build succeeded with code ${b.exitCode}`));
build.on('failure', b => console.log(`build failed with code ${b.exitCode}`));
build.on('complete', b => console.log(`build completed with code ${b.exitCode}`));

build.start();
