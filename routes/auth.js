var graph = require('fbgraph');

var conf = {
    client_id:      '1435123560061520'
  , client_secret:  'bb75ffb2201da17becf3bf8fe0376be6'
  , scope:          'email, user_about_me, friends_about_me, user_birthday, friends_birthday, user_education_history, friends_education_history, user_hometown, friends_hometown, user_interests, friends_interests, user_likes, friends_likes, user_location, friends_location, user_photos, friends_photos, user_relationships, friends_relationships, user_relationship_details, friends_relationship_details, user_work_history, friends_work_history, read_friendlists,user_relationships'
  , redirect_uri:   'http://localhost:3000/auth/facebook'
};

exports.auth = function(req, res) {

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
    res.redirect('/user');
  });
};