'use strict';

module.exports = function(app, env){

  app.get('/api/file', passport.needAuthentication(app, env), getList);
  app.get('/api/file/:fileType/:filename', passport.needAuthentication(app, env), getOne);
  app.post('/api/file', passport.needAuthentication(app, env), create);

  function getList(req, res){
    modules.file.getList(req.user.username).then(function(rows) {
      fn.resHelper(req, res).send(_.map(rows, modules.file.toJSON));
    }).catch(fn.respondFail(req, res));
  }

  function getOne(req, res){
    modules.file.getOne(req.user.username, req.params.fileType, req.params.filename).then(function(row) {
      fn.resHelper(req, res).send(modules.file.toJSON(row));
    }).catch(fn.respondFail(req, res));
  }

  function create(req, res){
    modules.file.create(req.user.username, req.files, req.body.title).then(function(row) {
      if (_.toLower(_.get(req, 'headers.Accept', '')) === 'application/json') {
        fn.resHelper(req, res).send(modules.file.toJSON(row));
      } else {
        res.redirect(303, env.publicHostUrl + '/uploadFile');
      }
    }).catch(fn.respondFail(req, res));
  }
};

