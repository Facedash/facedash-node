/**
 * Module dependencies.
 */
var _ = require('underscore');
var graph = require('fbgraph');
var util = require('../util/utils.js');

/* GET users listing. */
exports.info = function(req, res) {
  var user = null;
  var infoRequired = '/me/friends?fields=id,name,birthday,hometown,location,education,gender,interested_in,relationship_status,timezone,languages,locale';

  // Percentage function
  // var percentage = function(value1, value2){
  //   return Math.floor( ( value1 / ( value2 ) ) * 100 );
  // }

  graph.get('/me/', function(err, data) {
    user = {
      hometown: _.values(data.hometown)[1],
      location: _.values(data.location)[1],
      timezone: data.timezone,
      locale: data.locale
    }
  });

  graph.get(infoRequired, function(err, data) {
    user.friendsCount = _.pluck(data.data, 'id').length;

    res.send({  information: {
                  friendsNumber: user.friendsCount,
                  location: user.location,
                  hometown: user.hometown,
                },
                
                location: util.compareInfo(data.data, 'location', user),
                hometown: util.compareInfo(data.data, 'hometown', user),
                averageAge: util.AverageAge(data.data, user),
                relationshipStatus : util.breakDownInfo(data.data, 'relationship_status', user),
                gender: util.breakDownInfo(data.data, 'gender', user),
              });
  });
};