'use strict';

let express = require('express');

function ResponseError(res) {
  return Error(`Unexpected response (${res.statusCode})`);
}

module.exports = function(dockerAgent) {

  let api = express.Router();

  /** Get all containers */
  api.get('/', (req, res, next) => {
    dockerAgent.get('/containers/json?all=true', (err, response, body) => {
      if (err) next(err);
      else res.status(200).json(body);
    });
  });

  /** Inspect a specific container */
  api.get('/:containerId', (req, res, next) => {
    dockerAgent.get(`/containers/${req.params.containerId}/json`, (err, response, body) => {
      if (err) next(err);
      else res.status(200).json(body);
    });
  });

  /** Create and start a new container */
  // api.post('/containers', (req, resp, next) => {
  //   let name = 'test-container';
  //   let options = {
  //     Cmd: ['date'],
  //     Image: 'ubuntu:vivid'
  //   }
  //   dockerAgent.post({url: `/containers/create`, json: options}, (err, res, body) => {
  //     if (err) return next(err);
  //     if (res.statusCode !== 201) return next(ResponseError(res));
  //     let id = body.Id;
  //     dockerAgent.post({url: `/containers/${id}/start`, json: true}, (err, res) => {
  //       if (err) return next(err);
  //       if (res.statusCode !== 204) return next(ResponseError(res));
  //       resp.status(201).json(body);
  //     });
  //   });
  // });

  return api;
}
