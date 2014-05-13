/**
 * Module dependencies.
 */
var _ = require('underscore');
var graph = require('fbgraph');

/* GET users listing. */
exports.info = function(req, res) {
  
  var information  = {};

  var userLocation = null;
  var userHometown = null;
  var userLocationName = null;
  var userHometownName = null;
  var friendsCount = null;

  // Percentage function
  var percentage = function(value1, value2){
    return Math.floor( ( value1 / ( value2.length ) ) * 100 );
  }

  graph.get('/me/', function(err, data) {
    // console.log('User Data:',data);
    // console.log('User Data:',data.location);
    userHometown = _.values(data.hometown)[1];
    userLocation = _.values(data.location)[1];
  });

  // graph.get('/me/friends?fields=id,name,birthday,hometown,location,education,gender', function(err, data) {
  graph.get('/me/friends?fields=id,name,birthday,hometown,location,education,gender,interested_in,relationship_status,timezone,languages', function(err, data) {
    // console.log('\n\n\nFromOutside:',data);
    
    // console.log(data.data);
    var friendsIds = _.pluck(data.data, 'id');
    var friendsCount = friendsIds.length;
    console.log('FriendsCount:',friendsCount);

    // friends Count
    // friendsCount = results.length;
    // console.log('Count:', friendsCount);

    // Gender Count returns an object {female: ??, male: ??}
    var genderCount = _.countBy(data.data, function(item) {
      return item.gender === 'male' ? 'male': 'female';
    });

    genderCount.other = friendsCount - (genderCount.male + genderCount.female);

    var otherGenderPerc = Math.floor((genderCount.other/friendsCount)*100);
    var malePerc = Math.floor((genderCount.male/friendsCount)*100);
    var femalePerc = 100 - malePerc - otherGenderPerc;

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
    var averageAgeAccuracy = Math.floor((cleanBdays.length / friendsCount) * 100);

    // console.log('averageAge:', averageAge);
    // console.log('Accuracy age:', averageAgeAccuracy + '%');
    

    /////////////////////////////////////////////////////////////////////////////

    var friendsLocations = _.chain(data.data).pluck('location').compact().value();
    var friendsLocationsCount = friendsLocations.length;
    
    var sameLocation = _.filter(friendsLocations, function(city){return city['name'] === userLocation});
    // console.log('sameLocation:',sameLocation);

    var sameLocationCount = sameLocation.length;
    var sameLocationPerc = percentage(sameLocationCount,friendsLocations);
    var sameLocationAccuracy = Math.floor((friendsLocationsCount/friendsCount)*100);

    // console.log(sameLocation);
    console.log('same Location Perc:', sameLocationPerc);
    console.log('sameLocation Accuracy:', sameLocationAccuracy);

    /////////////////////////////////////////////////////////////////////////////

    var friendsHometowns = _.chain(data.data).pluck('hometown').compact().value();
    var friendsHometownsCount = friendsHometowns.length;

    var sameHometown = _.filter(friendsHometowns, function(city){return city['name'] === userHometown});
    // var sameHometown = _.where(friendsHometowns, userHometown);

    var sameHometownCount = sameHometown.length;
    var sameHometownPerc = percentage(sameHometownCount,friendsHometowns);
    var sameHometownAccuracy = Math.floor((friendsHometownsCount/friendsCount)*100);

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
    var friendsRstatusAccuracy = Math.floor((friendsRstatusCount/friendsCount) * 100);
    // console.log('friendsCount: ',friendsCount);
    // console.log('friendsRstatusCount: ',friendsRstatusCount);
    // console.log('friendsRstatusAccuracy: ',friendsRstatusAccuracy);
    
    // res.render('user', { friendsCount: friendsCount, userLocationName: userLocationName, userHometownName: userHometownName, otherGenderCount: otherGenderCount, otherGenderPerc: otherGenderPerc, maleCount: genderCount.male, malePerc: malePerc, femaleCount: genderCount.female, femalePerc: femalePerc, averageAge: averageAge, averageAgeAccuracy: averageAgeAccuracy, sameLocationCount: sameLocationCount,sameLocationPerc: sameLocationPerc, sameLocationAccuracy: sameLocationAccuracy, sameHometownCount: sameHometownCount,sameHometownPerc: sameHometownPerc, sameHometownAccuracy: sameHometownAccuracy, single: single, inArelationship: inArelationship, engaged: engaged, married: married, civilUnion: civilUnion, domesticPartnership: domesticPartnership, openRelationship: openRelationship, complicated: complicated, separated: separated, divorced: divorced, widowed: widowed, singlePerc: singlePerc, inArelationshipPerc: inArelationshipPerc, engagedPerc: engagedPerc, marriedPerc: marriedPerc, civilUnionPerc: civilUnionPerc, domesticPartnershipPerc: domesticPartnershipPerc, openRelationshipPerc: openRelationshipPerc, complicatedPerc: complicatedPerc, separatedPerc: separatedPerc, divorcedPerc: divorcedPerc, widowedPerc: widowedPerc, friendsRstatusAccuracy: friendsRstatusAccuracy});
    res.send({  information: {
                  friendsNumber: friendsCount,
                  location: userLocation,
                  hometown: userHometown,
                  averageAge: averageAge
                },
                
                relationshipStatus : relationshipStatus,

                counts: {
                  otherGender: genderCount.other,
                  male: genderCount.male,
                  female: genderCount.female,
                  sameLocation: sameLocationCount,
                  sameHometown: sameHometownCount
                },
                percentage: {
                  otherGender: otherGenderPerc,
                  male: malePerc,
                  female: femalePerc,
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