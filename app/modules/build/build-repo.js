'use strict';

module.exports = function Repo() {

  let builds = new Map();
  let idxContainerId = new Map();

  function put(build) {
    builds.set(build.id, build);
    if (build.containerId) {
      idxContainerId.set(build.containerId, build.id);
    }
  }

  function get(buildId) {
    return builds.get(buildId);
  }

  function index() {
    return builds.values();
  }

  function findByContainerId(containerId) {
    let buildId = idxContainerId.get(containerId);
    return buildId ? get(buildId) : null;
  }

  return {
    post, get, index, findByContainerId
  }
}
