/**
 * Module dependencies.
 */
var _ = require('underscore');
var graph = require('fbgraph');

/* GET users listing. */
exports.info = function(req, res) {
  console.log('info method in Profile');
  graph.get('/me/', function(err, data) {
    res.send(data);
  });
};
