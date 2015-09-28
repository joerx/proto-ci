'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');

let config = require('./configure');
let DockerAgent = require('./modules/docker-agent');
let Api = require('./modules/api');

let app = express();
let dockerAgent = DockerAgent(config.docker);

app.use(bodyParser.json());
app.use('/v1', Api(dockerAgent));
app.use(express.static(path.normalize(__dirname + '/../public')));

app.listen(3000, _ => console.log('Up on :3000'));
