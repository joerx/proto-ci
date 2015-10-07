'use strict';

let Container = require('./container');
let EventEmitter = require('events').EventEmitter;
let AgentError = require('./error').AgentError;

/**
 * Service to manage containers. Requires a DockerAgent instance.
 */
module.exports = function ContainerService(agent) {

  let self = Object.create(EventEmitter.prototype);

  self.create = function(options, fn) {

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
      else if (res.statusCode !== 201) fn(AgentError(res));
      else fn(null, Container(body.Id, agent, options));
    });
  }

  return self;
}
