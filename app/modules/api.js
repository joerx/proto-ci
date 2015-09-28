'use strict';

let express = require('express');

module.exports = function(dockerAgent) {

  let v1 = express.Router();

  v1.get('/', (req, res, next) => res.status(200).json({version: 'v1'}));

  v1.get('/info', (req, res, next) => {
    dockerAgent.get('/info', (err, response, body) => {
      if (err) next(err);
      else res.status(200).json(JSON.parse(body));
    });
  });

  v1.get('/containers', (req, res, next) => {
    dockerAgent.get('/containers/json?all=true', (err, response, body) => {
      if (err) next(err);
      else res.status(200).json(JSON.parse(body));
    });
  });

  return v1;
}
