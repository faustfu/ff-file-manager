'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const users = {
  zack: {
    username: 'zack',
    password: '1234',
    id: 1,
  },
  node: {
    username: 'node',
    password: '5678',
    id: 2,
  },
}

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

function authenticationMiddleware() {  
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    res.redirect('/');
  }
}
