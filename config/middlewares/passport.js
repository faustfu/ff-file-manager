'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const dev = require('../env/dev');
const test = require('../env/test');
const prod = require('../env/prod');

const users = {
    dev: dev.users,
    test: test.users,
    prod: prod.users,
}[process.env.NODE_ENV || 'dev'];

const localStrategy = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
  },
  function(username, password, done) {
    const user = users[username];

    if ( user == null ) {
      return done( null, false, { message: 'Invalid user' } );
    };

    if ( user.password !== password ) {
      return done( null, false, { message: 'Invalid password' } );
    };

    done( null, user );
  }
);

passport.serializeUser( (user, done) => {
  done(null, user)
});

passport.deserializeUser( (sessionUser, done) => {
  done(null, sessionUser)
});

passport.use('local', localStrategy);

passport.needAuthentication = authenticationMiddleware;

module.exports = passport;

function authenticationMiddleware(app, env) {  
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    res.redirect(env.publicHostUrl + '/');
  }
}
