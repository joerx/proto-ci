'use strict';

let express = require('express');

function UpstreamError(res) {
  return Error(`Unexpected response (${res.statusCode})`);
}

module.exports = function(dockerAgent) {

  let v1 = express.Router();

  v1.get('/', (req, res, next) => res.status(200).json({version: 'v1'}));

  /** docker host info */
  v1.get('/info', (req, res, next) => {
    dockerAgent.get('/info', (err, response, body) => {
      if (err) next(err);
      else res.status(200).json(JSON.parse(body));
    });
  });

  /** Get all containers */
  v1.get('/containers', (req, res, next) => {
    dockerAgent.get('/containers/json?all=true', (err, response, body) => {
      if (err) next(err);
      else res.status(200).json(JSON.parse(body));
    });
  });

  /** Inspect a specific container */
  v1.get('/containers/:containerId', (req, res, next) => {
    dockerAgent.get(`/containers/${req.params.containerId}/json`, (err, response, body) => {
      if (err) next(err);
      else res.status(200).json(JSON.parse(body));
    });
  });

  /** Create and start a new container */
  v1.post('/containers', (req, resp, next) => {
    let name = 'test-container';
    let options = {
      Cmd: ['date'],
      Image: 'ubuntu:vivid'
    }
    dockerAgent.post({url: `/containers/create`, json: options}, (err, res, body) => {
      if (err) return next(err);
      if (res.statusCode !== 201) return next(UpstreamError(res));
      let id = body.Id;
      dockerAgent.post({url: `/containers/${id}/start`, json: true}, (err, res) => {
        if (err) return next(err);
        if (res.statusCode !== 204) return next(UpstreamError(res));
        resp.status(201).json(body);
      });
    });
  });

  /** Get images */
  v1.get('/images', (req, res, next) => {
    dockerAgent.get('/images/json?all=0', (err, response, body) => {
      if (err) next(err);
      else res.status(200).json(JSON.parse(body));
    });
  });

  return v1;
}
