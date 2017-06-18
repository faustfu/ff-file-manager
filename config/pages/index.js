'use strict';

module.exports = function(app, env){
  app.get('/', root);
  app.post('/login', passport.authenticate('local', {
    session: true,
    successRedirect: '/uploadFile',
    failureRedirect: '/',
    failureFlash: true
  }));
  app.get('/uploadFile', passport.needAuthentication(), uploadFile);
  app.get('/fileList', passport.needAuthentication(), fileList);
  app.get('/logout', passport.needAuthentication(), logout);
};

function root(req, res) {
  res.render('login', {});
}

function uploadFile(req, res) {
  res.render('uploadFile', {
    active_menu_id: 1
  });
}

function fileList(req, res) {
  modules.file.getList(req.user.username).then(function(rows) {
    res.render('fileList', {
      active_menu_id: 2,
      files: _.map(rows, modules.file.toJSON)
    });
  }).catch(fn.respondFail(req, res));
}

function logout(req, res) {
  req.logout();
  req.session.destroy();
  res.redirect("/");
}