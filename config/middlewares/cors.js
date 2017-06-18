'use strict';

module.exports = cors;

function cors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, accept, access-control-allow-origin');
    
  // intercept OPTIONS method
  if ('OPTIONS' === req.method) {
    res.sendStatus(200);
  }
  else {
    next();
  }
}
