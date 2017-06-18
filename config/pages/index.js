'use strict';

module.exports = function(app, env){

    app.get('/', root);
    app.get('/uploadFile', uploadFile);
    app.get('/fileList', fileList);

};

function root(req, res) {
  res.render('login', {});
}

function uploadFile(req, res) {
  res.render('uploadFile', {
    access_token: req.access_token,
    active_menu_id: 1
  });
}

function fileList(req, res) {
  modules.file.getList(req.access_token).then(function(rows) {
    res.render('fileList', {
      access_token: req.access_token,
      active_menu_id: 2,
      files: _.map(rows, modules.file.toJSON)
    });
  }).catch(fn.respondFail(req, res));
}
