'use strict';

let EventEmitter = require('events').EventEmitter;
let AgentError = require('./error').AgentError;

/** 
 * Factory for container instances. Container is identified by an id, 3rd param contains options
 * container was created with.
 */
let Container = module.exports = function Container(id, agent, options) {

  let self = Object.create(EventEmitter.prototype);

  self.options = options;
  self.id = id;

  // setup wait. request blocks until the container stops. note that if the system dies 
  // while this is ongoing, we will never receive the exit code for this operation.
  // It's therefore not a smart idea to rely on the 'exit' event for anything critical.
  function waitContainer(fn) {
    agent.post(`/containers/${id}/wait`, (err, res, body) => {
      if (err) fn(err);
      else if (res.statusCode !== 200) fn(AgentError(res));
      else fn(null, {exitCode: body.StatusCode});
    });
  }

  function onExit(data) {
    self.exitCode = data.exitCode;
    self.emit('exit', self);
  }

  function startContainer() {
    agent.post({url: `/containers/${id}/start`, json: true}, (err, res) => {
      if (err) self.emit('error', err);
      if (res.statusCode !== 204) self.emit('error', AgentError(res));
      else {
        self.emit('start', self);
        waitContainer((err, data) => {
          if (err) self.emit('error', err);
          else onExit(data);
        });
      }
    });
  }

  // start the container, running the command passed in on `#create()`
  self.start = startContainer;

  return self;
}
