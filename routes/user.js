/**
 * Module dependencies.
 */
var _ = require('underscore');
var graph = require('fbgraph');

/* GET users listing. */
exports.info = function(req, res) {
  var userLocation = null;
  var userHometown = null;
  var userLocationName = null;
  var userHometownName = null;

  graph.get('/me/', function(err, data) {
    console.log('User Data:',data);
    // console.log('User Data:',data.location);
    userLocation = data.location;
    userHometown = data.hometown;
    userHometownName = _.values(userHometown)[1];
    userLocationName = _.values(userLocation)[1];
  });

  var friendsCount = null;

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

    var otherGenderCount = friendsCount - (genderCount.male + genderCount.female);
    console.log('CustomGender:',otherGenderCount);

    var otherGenderPerc = Math.floor((otherGenderCount/friendsCount)*100);

    var malePerc = Math.floor((genderCount.male/friendsCount)*100);
    var otherGenderPerc = Math.floor((otherGenderCount/friendsCount)*100);
    var femalePerc = 100 - malePerc - otherGenderPerc;
    // console.log('genderCount;',genderCount);
    /////////////////////////////////////////////////////////////////////////////
    
    var birthdays = _.compact(_.pluck(data.data, 'birthday'));
    // var validBirthdays = _.compact(birthdays)
    var trimmedBirthdays = _.reject(birthdays, function(item){
      return item.length <= 5;
    });

    var years = _.map(trimmedBirthdays, function(item){
      return parseInt(item.substr(-4));
    });

    var sum = _.reduce(years, function(memo, num){ return memo + num; }, 0);

    var d = new Date();
    var n = d.getFullYear();

    var averageAge = n - Math.floor(sum/years.length);
    var averageAgeAccuracy = Math.floor((years.length/friendsCount)*100);

    console.log('averageAge:', averageAge);
    console.log('Accuracy age:', averageAgeAccuracy + '%');
    

    /////////////////////////////////////////////////////////////////////////////


    var friendsLocations = _.compact(_.pluck(data.data, 'location'));
    var friendsLocationsCount = friendsLocations.length;
    var sameLocation = _.where(friendsLocations, userLocation);

    var sameLocationCount = sameLocation.length;
    var sameLocationPerc = Math.floor((sameLocationCount/friendsLocationsCount)*100);
    var sameLocationAccuracy = Math.floor((friendsLocationsCount/friendsCount)*100);

    // console.log(sameLocation);
    console.log('same Location Perc:', sameLocationPerc);
    console.log('sameLocation Accuracy:', sameLocationAccuracy);

    /////////////////////////////////////////////////////////////////////////////

    var friendsHometowns = _.compact(_.pluck(data.data, 'hometown'));
    var friendsHometownsCount = friendsHometowns.length;
    var sameHometown = _.where(friendsHometowns, userHometown);

    var sameHometownCount = sameHometown.length;
    var sameHometownPerc = Math.floor((sameHometownCount/friendsHometownsCount)*100);
    var sameHometownAccuracy = Math.floor((friendsHometownsCount/friendsCount)*100);

    console.log('same Hometown Perc:',sameHometownPerc);
    console.log('sameHometown Accuracy:',sameHometownAccuracy);


    /////////////////////////////////////////////////////////////////////////////
    var friendsRstatus = _.compact(_.pluck(data.data, 'relationship_status'));
    
    // console.log('friendsRStatus Count:',friendsRstatus.length);

    var status = {};
    var friendsRstatusCount = _.each(friendsRstatus, function(item){
      (!status[item]) ? status[item] = 1 : status[item]++;
    });
    // console.log(status);

    var single = (status['Single']) ? status['Single'] : 0;
    var inArelationship = (status['In a relationship']) ? status['In a relationship'] : 0;
    var engaged = (status['Engaged']) ? status['Engaged'] : 0;
    var married = (status['Married']) ? status['Married'] : 0;
    var civilUnion = (status['In a civil union']) ? status['In a civil union'] : 0;
    var domesticPartnership = (status['In a domestic partnership']) ? status['In a domestic partnership'] : 0;
    var openRelationship = (status['In an open relationship']) ? status['In an open relationship'] : 0;
    var complicated = (status['it\'s complicated']) ? status['it\'s complicated'] : 0;
    var separated = (status['Separated']) ? status['Separated'] : 0;
    var divorced = (status['Divorced']) ? status['Divorced'] : 0;
    var widowed = (status['Widowed']) ? status['Widowed'] : 0;
    

    var singlePerc = Math.floor((single/(friendsRstatus.length))*100);
    var inArelationshipPerc = Math.floor((inArelationship/(friendsRstatus.length))*100);
    var engagedPerc = Math.floor((engaged/(friendsRstatus.length))*100);
    var marriedPerc = Math.floor((married/(friendsRstatus.length))*100);
    var civilUnionPerc = Math.floor((civilUnion/(friendsRstatus.length))*100);
    var domesticPartnershipPerc = Math.floor((domesticPartnership/(friendsRstatus.length))*100);
    var openRelationshipPerc = Math.floor((openRelationship/(friendsRstatus.length))*100);
    var complicatedPerc = Math.floor((complicated/(friendsRstatus.length))*100);
    var separatedPerc = Math.floor((separated/(friendsRstatus.length))*100);
    var divorcedPerc = Math.floor((divorced/(friendsRstatus.length))*100);
    var widowedPerc = Math.floor((widowed/(friendsRstatus.length))*100);

    
    var friendsRstatusCount = friendsRstatus.length;
    var friendsRstatusAccuracy = Math.floor((friendsRstatusCount/friendsCount) * 100);
    console.log('friendsCount: ',friendsCount);
    console.log('friendsRstatusCount: ',friendsRstatusCount);
    console.log('friendsRstatusAccuracy: ',friendsRstatusAccuracy);

    // console.log('SingleFriends:',singlePerc);
    // console.log('In a relationship:',inArelationshipPerc);
    // console.log(domesticPartnership);



    // console.log(sameHometown);
    // console.log('Num sameHometown:',sameHometown.length);

    // console.log(locationNames);

    // console.log('User Location:',userLocation);
    // console.log('User hometown:',userHometown);
    
    // res.render('user', { friendsCount: friendsCount, userLocationName: userLocationName, userHometownName: userHometownName, otherGenderCount: otherGenderCount, otherGenderPerc: otherGenderPerc, maleCount: genderCount.male, malePerc: malePerc, femaleCount: genderCount.female, femalePerc: femalePerc, averageAge: averageAge, averageAgeAccuracy: averageAgeAccuracy, sameLocationCount: sameLocationCount,sameLocationPerc: sameLocationPerc, sameLocationAccuracy: sameLocationAccuracy, sameHometownCount: sameHometownCount,sameHometownPerc: sameHometownPerc, sameHometownAccuracy: sameHometownAccuracy, single: single, inArelationship: inArelationship, engaged: engaged, married: married, civilUnion: civilUnion, domesticPartnership: domesticPartnership, openRelationship: openRelationship, complicated: complicated, separated: separated, divorced: divorced, widowed: widowed, singlePerc: singlePerc, inArelationshipPerc: inArelationshipPerc, engagedPerc: engagedPerc, marriedPerc: marriedPerc, civilUnionPerc: civilUnionPerc, domesticPartnershipPerc: domesticPartnershipPerc, openRelationshipPerc: openRelationshipPerc, complicatedPerc: complicatedPerc, separatedPerc: separatedPerc, divorcedPerc: divorcedPerc, widowedPerc: widowedPerc, friendsRstatusAccuracy: friendsRstatusAccuracy});
    res.send({  information: {
                  friendsNumber: friendsCount,
                  userLocationName: userLocationName,
                  userHometownName: userHometownName,
                  averageAge: averageAge
                },
                counts: {
                  otherGender: otherGenderCount,
                  male: genderCount.male,
                  female: genderCount.female,
                  sameLocation: sameLocationCount,
                  sameHometown: sameHometownCount,
                  single: single,
                  inArelationship: inArelationship,
                  engaged: engaged,
                  married: married,
                  civilUnion: civilUnion,
                  domesticPartnership: domesticPartnership,
                  openRelationship: openRelationship,
                  complicated: complicated,
                  separated: separated,
                  divorced: divorced,
                  widowed: widowed
                },
                percentage: {
                  otherGender: otherGenderPerc,
                  male: malePerc,
                  female: femalePerc,
                  sameLocation: sameLocationPerc,
                  sameHometown: sameHometownPerc,
                  single: singlePerc,
                  inArelationship: inArelationshipPerc,
                  engaged: engagedPerc,
                  married: marriedPerc,
                  civilUnion: civilUnionPerc,
                  domesticPartnership: domesticPartnershipPerc,
                  openRelationship: openRelationshipPerc,
                  complicated: complicatedPerc,
                  separated: separatedPerc,
                  divorced: divorcedPerc,
                  widowed: widowedPerc
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
