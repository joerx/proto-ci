'use strict';

module.exports = function monitor(agent, emitter) {

  let ts = Math.floor(Date.now() / 1000);

  function connect() {

    let req = agent.get({url: '/events?since=' + ts, json: false}, err => {
      if(err) emitter.emit('error', err);
      else {
        connect();
        ts = Math.floor(Date.now() / 1000);
      }
    });

    req.on('data', function(data) {
      let e = JSON.parse(data.toString('utf-8'));
      emitter.emit(`container:${e.status}`, e);
    });
  }

  connect();
}
