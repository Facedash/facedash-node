var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var underscore = require('underscore');
// added the fbGraph module here
var graph = require('fbgraph');


// this should really be in a config file!
// facebook configuration file
var conf = {
    client_id:      '176524962546904'
  , client_secret:  '6e701a88b5a0f15b734e8cdc92abf5b9'
  , scope:          'email, user_about_me, friends_about_me, user_birthday, friends_birthday, user_education_history, friends_education_history, user_hometown, friends_hometown, user_interests, friends_interests, user_likes, friends_likes, user_location, friends_location, user_photos, friends_photos, user_relationships, friends_relationships, user_relationship_details, friends_relationship_details, user_work_history, friends_work_history, read_friendlists,user_relationships'
  , redirect_uri:   'http://facedash.azurewebsites.net/'
};

var routes = require('./routes');
var users = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/', function(req, res){
  res.render('index', { title: 'latif' });
});
// app.get('/users', users.list);


// Fcaebook Routes //////////////////////////
app.get('/auth/facebook', function(req, res) {

  // we don't have a code yet
  // so we'll redirect to the oauth dialog
  if (!req.query.code) {
    var authUrl = graph.getOauthUrl({
        "client_id":     conf.client_id
      , "redirect_uri":  conf.redirect_uri
      , "scope":         conf.scope
    });

    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
      res.redirect(authUrl);
    } else {  //req.query.error == 'access_denied'
      res.send('access denied');
    }
    return;
  }

  // code is set
  // we'll send that and get the access token
  graph.authorize({
      "client_id":      conf.client_id
    , "redirect_uri":   conf.redirect_uri
    , "client_secret":  conf.client_secret
    , "code":           req.query.code
  }, function (err, facebookRes) {
    //here as soon as we login in we gather user info
    // graph.get('/me/', function(err, res) {
    // // console.log('LoggedIn:',res);
    // console.log(res);
    // console.log(res.name);
    // // var oneUser = res;
    // // myDataRef.set({name: res.name, text: res.birthday});
    // });
    res.redirect('/user');
  });
});

// user gets sent here after being authorized
// app.get('/user', function(req, res) {
//   graph.get('/me/', function(err, res) {
//     var userLoggedIn = res;
//       console.log('LoggedIn:',userLoggedIn);
//       console.log('name:',userLoggedIn.name);
//   });
//   // console.log('LoggedIn:',userLoggedIn);
//   res.render('user', { title: 'Welcome', name: res});
// });

app.get('/user', function(req, res) {
  var userLocation = null;
  var userHometown = null;
  var userLocationName = null;
  var userHometownName = null;

  graph.get('/me/', function(err, data) {
    console.log('User Data:',data);
    // console.log('User Data:',data.location);
    userLocation = data.location;
    userHometown = data.hometown;
    userHometownName = underscore.values(userHometown)[1];
    userLocationName = underscore.values(userLocation)[1];
  });

  var friendsCount = null;

  // graph.get('/me/friends?fields=id,name,birthday,hometown,location,education,gender', function(err, data) {
  graph.get('/me/friends?fields=id,name,birthday,hometown,location,education,gender,interested_in,relationship_status,timezone,languages', function(err, data) {
    // console.log('\n\n\nFromOutside:',data);
    
    // console.log(data.data);
    var friendsIds = underscore.pluck(data.data, 'id');
    var friendsCount = friendsIds.length;
    console.log('FriendsCount:',friendsCount);

    // friends Count
    // friendsCount = results.length;
    // console.log('Count:', friendsCount);

    // Gender Count returns an object {female: ??, male: ??}
    var genderCount = underscore.countBy(data.data, function(item) {
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
    
    var birthdays = underscore.compact(underscore.pluck(data.data, 'birthday'));
    // var validBirthdays = underscore.compact(birthdays)
    var trimmedBirthdays = underscore.reject(birthdays, function(item){
      return item.length <= 5;
    });

    var years = underscore.map(trimmedBirthdays, function(item){
      return parseInt(item.substr(-4));
    });

    var sum = underscore.reduce(years, function(memo, num){ return memo + num; }, 0);

    var d = new Date();
    var n = d.getFullYear();

    var averageAge = n - Math.floor(sum/years.length);
    var averageAgeAccuracy = Math.floor((years.length/friendsCount)*100);

    console.log('averageAge:', averageAge);
    console.log('Accuracy age:', averageAgeAccuracy + '%');
    

    /////////////////////////////////////////////////////////////////////////////


    var friendsLocations = underscore.compact(underscore.pluck(data.data, 'location'));
    var friendsLocationsCount = friendsLocations.length;
    var sameLocation = underscore.where(friendsLocations, userLocation);

    var sameLocationCount = sameLocation.length;
    var sameLocationPerc = Math.floor((sameLocationCount/friendsLocationsCount)*100);
    var sameLocationAccuracy = Math.floor((friendsLocationsCount/friendsCount)*100);

    // console.log(sameLocation);
    console.log('same Location Perc:', sameLocationPerc);
    console.log('sameLocation Accuracy:', sameLocationAccuracy);

    /////////////////////////////////////////////////////////////////////////////

    var friendsHometowns = underscore.compact(underscore.pluck(data.data, 'hometown'));
    var friendsHometownsCount = friendsHometowns.length;
    var sameHometown = underscore.where(friendsHometowns, userHometown);

    var sameHometownCount = sameHometown.length;
    var sameHometownPerc = Math.floor((sameHometownCount/friendsHometownsCount)*100);
    var sameHometownAccuracy = Math.floor((friendsHometownsCount/friendsCount)*100);

    console.log('same Hometown Perc:',sameHometownPerc);
    console.log('sameHometown Accuracy:',sameHometownAccuracy);


    /////////////////////////////////////////////////////////////////////////////
    var friendsRstatus = underscore.compact(underscore.pluck(data.data, 'relationship_status'));
    
    // console.log('friendsRStatus Count:',friendsRstatus.length);

    var status = {};
    var friendsRstatusCount = underscore.each(friendsRstatus, function(item){
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
    
    res.render('user', { friendsCount: friendsCount, userLocationName: userLocationName, userHometownName: userHometownName, otherGenderCount: otherGenderCount, otherGenderPerc: otherGenderPerc, maleCount: genderCount.male, malePerc: malePerc, femaleCount: genderCount.female, femalePerc: femalePerc, averageAge: averageAge, averageAgeAccuracy: averageAgeAccuracy, sameLocationCount: sameLocationCount,sameLocationPerc: sameLocationPerc, sameLocationAccuracy: sameLocationAccuracy, sameHometownCount: sameHometownCount,sameHometownPerc: sameHometownPerc, sameHometownAccuracy: sameHometownAccuracy, single: single, inArelationship: inArelationship, engaged: engaged, married: married, civilUnion: civilUnion, domesticPartnership: domesticPartnership, openRelationship: openRelationship, complicated: complicated, separated: separated, divorced: divorced, widowed: widowed, singlePerc: singlePerc, inArelationshipPerc: inArelationshipPerc, engagedPerc: engagedPerc, marriedPerc: marriedPerc, civilUnionPerc: civilUnionPerc, domesticPartnershipPerc: domesticPartnershipPerc, openRelationshipPerc: openRelationshipPerc, complicatedPerc: complicatedPerc, separatedPerc: separatedPerc, divorcedPerc: divorcedPerc, widowedPerc: widowedPerc, friendsRstatusAccuracy: friendsRstatusAccuracy});
  });
});


///////////////////////////////////////////////////////////////


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  // debug('Express server listening on port ' + server.address().port);
});

module.exports = app;