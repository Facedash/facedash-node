/**
 * Module dependencies.
 */
var _ = require('underscore');
var graph = require('fbgraph');
var util = require('../util/utils.js');

/* GET users listing. */
exports.info = function(req, res) {
  var user = {};
  var infoRequired = '/me/friends?fields=id,name,birthday,hometown,location,education,gender,interested_in,relationship_status,timezone,languages,locale';

  graph.batch([
  {
    method: 'GET',
    relative_url: 'me' // Get the current user's profile information
  },
  {
    method: 'GET',
    relative_url: infoRequired // Get the first 50 friends of the current user
  }],
  function(err, data) {
    console.log('this is the batch result 0', data[0].body);
    console.log('this is the batch result 1', data[1].body);
    var data0 = JSON.parse(data[0].body);
    var data1 = JSON.parse(data[1].body);

    user = {
      hometown: _.values(data0.hometown)[1],
      location: _.values(data0.location)[1],
      timezone: data0.timezone,
      locale: data0.locale,
      friendsCount: data1.summary.total_count
    };

    res.send({
      information: {friendsNumber: user.friendsCount, location: user.location, hometown: user.hometown},
      location: util.compareInfo(data1.data, 'location', user),
      hometown: util.compareInfo(data1.data, 'hometown', user),
      averageAge: util.AverageAge(data1.data, user),
      relationshipStatus : util.breakDownInfo(data1.data, 'relationship_status', user),
      gender: util.breakDownInfo(data1.data, 'gender', user),
    });    
  });
};