'use strict';

module.exports = function(app, env){
  require(__base + '/config/pages')(app, env);

  require(__base + '/src/api/file')(app, env);

  app.use(clientErrorHandler);
  app.use(errorHandler);

  function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
      res.status(500).send({
        publicHostUrl: env.publicHostUrl,
        error: 'Something failed!'
      });
    } else {
      next(err);
    }
  }

  function errorHandler(err, req, res, next) {
    res.status(500);
    res.render('error', {
      publicHostUrl: env.publicHostUrl,
      code : 500, message : err
    });
  }
};

