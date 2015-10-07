'use strict';

let EventEmitter = require('events').EventEmitter;
let AgentError = require('./error').AgentError;

/** 
 * Factory for container instances. Container is identified by an id, 3rd param contains options
 * container was created with.
 */
module.exports = function Container(id, agent, options) {

  let self = Object.create(EventEmitter.prototype);

  self.options = options;
  self.id = id;

  // wait for a container to exit
  function waitContainer(fn) {
    agent.post(`/containers/${id}/wait`, (err, res, body) => {
      if (err) fn(err);
      else if (res.statusCode !== 200) fn(Oops(res));
      else fn(null, {exitCode: body.StatusCode});
    });
  }

  // start the container, running the command passed in on `#create()`
  self.start = function(done) {
    agent.post({url: `/containers/${id}/start`, json: true}, (err, res) => {
      if (err) done(err);
      if (res.statusCode !== 204) done(AgentError(res));
      else {
        self.emit('start', self);

        // setup wait. request blocks until the container stops. note that if the system dies 
        // while this is ongoing, we will never receive the exit code for this operation.
        // It's therefore not a smart idea to rely on the 'exit' event for anything critical.
        waitContainer((err, data) => {
          if (err) self.emit('error', err, self);
          else {
            self.exitCode = data.exitCode;
            self.emit('exit', self);
          }
        });

        // don't wait for container to exit - just call back immediately
        done(null, self);
      }
    });
  }

  return self;
}
