'use strict';

let DockerAgent = require('../docker-agent');
let EventEmitter = require('events').EventEmitter;

/**
 * Docker management API
 */
module.exports = function Docker(config) {
  let agent = DockerAgent(config);
  let containerSvc = ContainerService(agent);
  return {
    Container: containerSvc
  };
}

/** 
 * Factory for container instances. Container is identified by an id, 3rd param contains options
 * container was created with.
 */
function Container(id, agent, options) {
  let container = Object.create(EventEmitter.prototype);

  container.options = options;
  container.id = id;

  // wait for container to exit
  function waitContainer(fn) {
    agent.post(`/containers/${id}/wait`, (err, res, body) => {
      if (err) fn(err);
      else if (res.statusCode !== 200) fn(Oops(res));
      else fn(null, {exitCode: body.StatusCode});
    });
  }

  // start the container, running the command passed in on `#create()`
  container.start = function startContainer(done) {
    agent.post({url: `/containers/${id}/start`, json: true}, (err, res) => {
      if (err) done(err);
      if (res.statusCode !== 204) done(Oops(res));
      else {
        container.emit('start', container);

        // setup wait. blocks until the container stops. note that if the ci-server dies while this 
        // is ongoing, we will never receive the exit code for this operation.
        // I guess some sort of integrity-check on startup to update builds could be advisable.
        waitContainer((err, data) => {
          if (err) container.emit('error', err, container);
          else {
            container.exitCode = data.exitCode;
            container.emit('exit', container);
          }
        });

        // don't wait for container to exit - just call back immediately
        done(null, container);
      }
    });
  }

  return container;
}

/**
 * Creates an Error representing given unexpected docker agent response.
 */
function Oops(res) {
  // console.log(res);
  return Error(`${res.statusCode} - ` + res.body.trim());
}

/**
 * Service to manage containers. Requires a DockerAgent instance.
 */
function ContainerService(agent) {
  return {
    create: function createContainer(options, fn) {

      let cId = options.pId || '1234'; // todo: generate uniqid
      let cName = options.name || `docker=${cId}`;

      let hostConfig = {};
      if (options.volumesFrom) hostConfig.VolumesFrom = options.volumesFrom;

      let cOptions = {
        Cmd: options.cmd || 'pwd',
        Image: options.image || 'ubuntu:14.04',
        Hostname: options.hostname || `docker-${cId}`,
        WorkingDir: options.workDir || '/workspace',
        HostConfig: hostConfig
      };

      agent.post({url: `/containers/create?name=${cName}`, json: cOptions}, (err, res, body) => {
        if (err) return fn(err);
        else if (res.statusCode !== 201) fn(Oops(res));
        else fn(null, Container(body.Id, agent, options));
      });

    }
  }
}
