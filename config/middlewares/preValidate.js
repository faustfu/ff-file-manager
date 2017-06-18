'use strict';

var mod = function(app){

	app.use(mustValidation);

};

module.exports = mod;

////////
function mustValidation(req, res, next){
  var path = req.path || '';

  var includes = [
    '/',
    '/api',
    '/uploadFile',
    '/fileList',
  ];
  var excludes = [
    '/api/hello',
    '/api/login',
  ];
  var excludeRe = [
    /^\/api\/post\/\S+\/image$/
  ];

  if (_.some(includes, function(e) { return path.startsWith(e); })) {
    if (_.some(excludes, function(e) { return path.startsWith(e); })) return next();
    if (_.some(excludeRe, function(e) {
        return path.match(e);
      })
    ) return next();

    validate(req, res, next);
  } else {
    return next();
  }
}

function validate(req, res, next){ //used by hosting api
  var header_access_token = req.headers && (req.headers['Authorization'] || req.headers['authorization']);
  var query_access_token = req.query && (req.query.Authorization || req.query.authorization);
  var body_access_token = req.body && (req.body.Authorization || req.body.authorization);

  // console.log('header_access_token=' + header_access_token);
  // console.log('query_access_token=' + query_access_token);
  // console.log('body_access_token=' + body_access_token);

  if (header_access_token) {
      req.access_token = header_access_token.replace('Basic ', '').trim();
  } else if (query_access_token) {
      req.access_token = query_access_token.trim();
  } else if (body_access_token) {
      req.access_token = body_access_token.trim();
  }

  if(!req.access_token) {
    next('access_token not set.');
  } else {
    next();
  }
}
