'use strict';

let express = require('express');
let uniqid = require('uniqid');
let validate = require('./validate');

module.exports = function(buildService) {

  let api = express();

  api.post('/', (req, res, next) => {

    let opts, build;

    opts = req.body;
    opts.projectId = uniqid();

    validate(opts.gitUrl, 'gitUrl must be set');
    validate(opts.gitBranch, 'gitBranch must be set');
    validate(opts.testCmd, 'testCmd must be set');
    validate(opts.image, 'image must be set');

    build = buildService.createBuild(opts)

    build.on('start', build => res.status(201).json({
        message: `Build ${build.id} started`, 
        id: build.id,
        options: opts
      }))
    
    build.start();
  });

  return api;
}
