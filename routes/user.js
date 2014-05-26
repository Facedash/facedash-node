/**
 * Module dependencies.
 */
var _ = require('underscore');
var graph = require('fbgraph');

/* GET users listing. */
exports.info = function(req, res) {
  
  var user  = {
    location: null,
    hometown: null,
    friendsCount: null
  };

  var infoRequired = '/me/friends?fields=id,name,birthday,hometown,location,education,gender,interested_in,relationship_status,timezone,languages';

  // Percentage function
  var percentage = function(value1, value2){
    return Math.floor( ( value1 / ( value2.length ) ) * 100 );
  }

  graph.get('/me/', function(err, data) {
    // console.log('User Data:',data);
    // console.log('User Data:',data.location);
    user.hometown = _.values(data.hometown)[1];
    user.location = _.values(data.location)[1];
  });

  graph.get(infoRequired, function(err, data) {
    // console.log('\n\n\nFromOutside:',data);
    
    // console.log(data.data);
    // var friendsIds = _.pluck(data.data, 'id');
    user.friendsCount = _.pluck(data.data, 'id');
    console.log('FriendsCount:',user.friendsCount);

    // Gender Count returns an object {female: ??, male: ??}
    var genders = _.countBy(data.data, function(item) {
      return item.gender === 'male' ? 'male': 'female';
    });

    genders.male = [genders.male];
    genders.female = [genders.female];
    genders.other = [user.friendsCount.length - genders.male[0] - genders.female[0]];

    genders.male.push(percentage(genders.male[0],user.friendsCount));
    genders.other.push(percentage(genders.other[0],user.friendsCount));
    genders.female.push(100 - genders.male[1] - genders.other[1]);

    /////////////////////////////////////////////////////////////////////////////
    
    // Array of birthday Years
    var cleanBdays = _.chain(data.data)
                          .pluck('birthday')
                          .compact()
                          .reject(function(item){return item.length <= 5})
                          .map(function(item){return parseInt(item.substr(-4))})
                          .value();

    // Sum of array of birthday Years
    var cleanBdaysAvg = _.chain(cleanBdays)
                          .reduce(function(memo, num){ return memo + num }, 0)
                          .value();

    // console.log('cleanBdays:', cleanBdays);
    // console.log('cleanBdaysAvg:', cleanBdaysAvg);
    
    var year = new Date().getFullYear();

    var averageAge = year - Math.floor(cleanBdaysAvg / cleanBdays.length);
    var averageAgeAccuracy = percentage(cleanBdays.length, user.friendsCount);

    /////////////////////////////////////////////////////////////////////////////

    var friendsLocations = _.chain(data.data).pluck('location').compact().value();
    
    var sameLocation = _.filter(friendsLocations, function(city){return city['name'] === user.location});
    var sameLocationPerc = percentage(sameLocation.length,friendsLocations);
    var sameLocationAccuracy = percentage(friendsLocations.length,user.friendsCount);

    // console.log(sameLocation);
    console.log('same Location Perc:', sameLocationPerc);
    console.log('sameLocation Accuracy:', sameLocationAccuracy);

    /////////////////////////////////////////////////////////////////////////////

    var friendsHometowns = _.chain(data.data).pluck('hometown').compact().value();

    var sameHometown = _.filter(friendsHometowns, function(city){return city['name'] === user.hometown});
    var sameHometownPerc = percentage(sameHometown.length,friendsHometowns);
    var sameHometownAccuracy = percentage(friendsHometowns.length,user.friendsCount);

    console.log('same Hometown Perc:',sameHometownPerc);
    console.log('sameHometown Accuracy:',sameHometownAccuracy);


    /////////////////////////////////////////////////////////////////////////////
    var friendsRstatus = _.compact(_.pluck(data.data, 'relationship_status'));

    // Count per relationship status
    var relationshipStatus = {};
    var friendsRstatusCount = _.each(friendsRstatus, function(item){
      (!relationshipStatus[item]) ? relationshipStatus[item] = [1] : relationshipStatus[item][0]++;
    });

    // Percentage per relationship status
    _.each(relationshipStatus, function(value, key){
      relationshipStatus[key].push(percentage(value, friendsRstatus));
    });

    console.log(relationshipStatus);
    
    var friendsRstatusCount = friendsRstatus.length;
    var friendsRstatusAccuracy = percentage(friendsRstatusCount,user.friendsCount);

    res.send({  information: {
                  friendsNumber: user.friendsCount.length,
                  location: user.location,
                  hometown: user.hometown,
                  averageAge: averageAge
                },
                
                relationshipStatus : relationshipStatus,
                genders: genders,

                counts: {
                  sameLocation: sameLocation.length,
                  sameHometown: sameHometown.length
                },
                percentage: {
                  sameLocation: sameLocationPerc,
                  sameHometown: sameHometownPerc
                },
                accuracy:{
                  averageAge: averageAgeAccuracy,
                  sameLocation: sameLocationAccuracy,
                  sameHometown: sameHometownAccuracy,
                  friendsRstatus: friendsRstatusAccuracy
                }
              });
  });
};