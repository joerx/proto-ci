'use strict';

let express = require('express');

module.exports = function(dockerAgent) {

  let api = express.Router();

  api.get('/', (req, resp, next) => {
    dockerAgent.get({url: '/version'}, (err, res, body) => {
      if (err) next(err);
      else resp.status(200).json(body);
    });
  });

  api.get('/info', (req, res, next) => {
    dockerAgent.get({url: '/info'}, (err, response, body) => {
      if (err) next(err);
      else res.status(200).json(body);
    });
  });

  return api;
}
