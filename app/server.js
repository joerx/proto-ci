'use strict';

let logger = require('winston');
let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');

let config = require('./configure');
let Docker = require('./modules/docker');
let BuildService = require('./modules/build');
let api = require('./modules/api');

let app = express();
let docker = Docker(config.docker);
let buildService = BuildService(docker);
// let dockerAgent = docker.agent;

logger.level = config.logLevel;

app.use(bodyParser.json());

app.use('/v1', api.Info(docker.agent));
app.use('/v1/containers', api.Containers(docker.agent));
app.use('/v1/images', api.Images(docker.agent));
app.use('/v1/builds', api.Builds(buildService));
app.use(api.errorHandler);

app.use(express.static(path.normalize(__dirname + '/../public')));

app.listen(3000, () => console.log('Up on :3000'));
