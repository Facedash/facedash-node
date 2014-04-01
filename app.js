var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// added the fbGraph module here
var graph = require('fbgraph');

// this should really be in a config file!
// facebook configuration file
var conf = {
    client_id:      '176524962546904'
  , client_secret:  '6e701a88b5a0f15b734e8cdc92abf5b9'
  , scope:          'email, user_about_me, friends_about_me, user_birthday, friends_birthday, user_education_history, friends_education_history, user_hometown, friends_hometown, user_interests, friends_interests, user_likes, friends_likes, user_location, friends_location, user_photos, friends_photos, user_relationships, friends_relationships, user_relationship_details, friends_relationship_details, user_work_history, friends_work_history, read_friendlists,user_relationships'
  , redirect_uri:   'http://localhost:3000/auth/facebook'
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
  var oneUser = null;

  graph.get('/me/friends?fields=id,name,birthday,hometown,location,education,gender,interested_in,relationship_status,timezone,languages', function(err, data) {
    console.log('\n\n\nFromOutside:',data);
    res.render('user', { title: 'Welcome'});
  });
  
  // console.log('LoggedIn:',oneUser);
  // console.log('LoggedIn:',oneUser.name);
  // res.render('user', { title: 'Welcome', name: oneUser.name });
  // res.send();
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