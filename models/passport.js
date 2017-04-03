var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('./UserModel.js')
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

var FACEBOOK_APP_ID = '120960458442807',
    FACEBOOK_APP_SECRET = '9459c9f21574bae837dec9554870a9c0';

//passport configuration here
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:8000/auth/facebook/callback",
    profileFields : ['id', 'displayName', 'photos', 'email' ]
  },
  function(accessToken, refreshToken, profile, done) {
    // console.log("This is profile" , profile);
    // return done(null,profile);
    User.findOne({'socialId' : profile.id}, function(err, user) {
      if(err){
        console.log("ERROR");
        return done(err);
      }
      //If no user was found, create a new user with details from the facebook profile
      if (!user){
        console.log("can not find any user with id ", profile.id, " create new user");
        user = new User ({
          name: profile.displayName,
          socialId: profile.id,
          provider: 'facebook',
          email: profile.emails ? profile.emails[0].value : "",
          loginCount: 0
        })
      }
      //user was find
      else{
        console.log("found user" , user);
        user.loginCount ++;
      }
      //save user on the DB
      user.save(function(err,savedUser){
        if(err){
          return done(err);
        }
        else {
          var token = jwt.sign({name : savedUser.name, id : savedUser._id} , "MySecretKey" , {expiresIn : "2d"});
          return done(null, {token : token , name:savedUser.name});
        }
      })
    })
  }));

module.exports = passport;
