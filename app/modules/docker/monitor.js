'use strict';

let logger = require('winston');

function now() {
  return Math.floor(Date.now() / 1000);
}

module.exports = function monitor(agent, emitter) {

  let ts = now();

  function connect() {

    let req = agent.get({url: '/events?since=' + ts, json: false}, err => {
      if (err) emitter.emit('error', err);
      else {
        connect();
        ts = now();
      }
    });

    req.on('data', function(data) {
      let e = JSON.parse(data.toString('utf-8'));
      emitter.emit(`container:${e.status}`, e);
    });
  }

  connect();
}
