'use strict';

module.exports = function(app, env){
  app.get('/', root);
  app.post('/login', passport.authenticate('local', {
    session: true,
    successRedirect: env.publicHostUrl + '/uploadFile',
    failureRedirect: env.publicHostUrl + '/',
    failureFlash: true
  }));
  app.get('/uploadFile', passport.needAuthentication(app, env), uploadFile);
  app.get('/fileList', passport.needAuthentication(app, env), fileList);
  app.get('/logout', passport.needAuthentication(app, env), logout);

  function root(req, res) {
    res.render('login', { publicHostUrl: env.publicHostUrl });
  }

  function uploadFile(req, res) {
    res.render('uploadFile', {
      publicHostUrl: env.publicHostUrl,
      active_menu_id: 1,
    });
  }

  function fileList(req, res) {
    modules.file.getList(req.user.username).then(function(rows) {
      res.render('fileList', {
        publicHostUrl: env.publicHostUrl,
        active_menu_id: 2,
        files: _.map(rows, modules.file.toJSON)
      });
    }).catch(fn.respondFail(req, res));
  }

  function logout(req, res) {
    req.logout();
    req.session.destroy();
    res.redirect(env.publicHostUrl + '/');
  }
};