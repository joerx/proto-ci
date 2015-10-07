'use strict';

let express = require('express');

module.exports = function(dockerAgent) {

  let api = express.Router();

  api.get('/', (req, res, next) => {
    dockerAgent.get('/images/json?all=0', (err, response, body) => {
      if (err) next(err);
      else res.status(200).json(body);
    });
  });

  return api;
}
