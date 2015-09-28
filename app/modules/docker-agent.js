'use strict';

let fs = require('fs');
let url = require('url');
let path = require('path');
let assert = require('assert');
let request = require('request');

module.exports = function DockerAgent(config) {

  console.warn('Notice: this is a synchronous call, use only during boot!')

  assert(config.host, 'Docker host is missing');
  assert(config.certsPath, 'Client cert path is missing');

  let cert = fs.readFileSync(path.normalize(`${config.certsPath}/cert.pem`));
  let key = fs.readFileSync(path.normalize(`${config.certsPath}/key.pem`));
  let ca = fs.readFileSync(path.normalize(`${config.certsPath}/ca.pem`));

  let parts = url.parse(config.host);
  let dockerUrl = `https://${parts.hostname}:${parts.port}/info`;

  let agent = request.defaults({
    baseUrl: `https://${parts.hostname}:${parts.port}/`,
    agentOptions: {cert, key, ca}
  });

  return agent;
}
