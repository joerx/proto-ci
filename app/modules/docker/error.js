'use strict';

module.exports = {
  AgentError: function(res) {
    return Error(`${res.statusCode} - ` + res.body.trim());
  }
}
