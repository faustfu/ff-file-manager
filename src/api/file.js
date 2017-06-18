'use strict';

module.exports = function(app, env){

  app.get('/api/file', getList);
  app.get('/api/file/:fileType/:filename', getOne);
  app.post('/api/file', create);

};

function getList(req, res){
  modules.file.getList(req.access_token).then(function(rows) {
    fn.resHelper(req, res).send(_.map(rows, modules.file.toJSON));
  }).catch(fn.respondFail(req, res));
}

function getOne(req, res){
  modules.file.getOne(req.access_token, req.params.fileType, req.params.filename).then(function(row) {
    fn.resHelper(req, res).send(modules.file.toJSON(row));
  }).catch(fn.respondFail(req, res));
}

function create(req, res){
  modules.file.create(req.access_token, req.files, req.body.title).then(function(row) {
    if (_.toLower(_.get(req, 'headers.Accept', '')) === 'application/json') {
      fn.resHelper(req, res).send(modules.file.toJSON(row));
    } else {
      res.redirect(303, '/uploadFile?authorization=' + req.access_token);
    }
  }).catch(fn.respondFail(req, res));
}
