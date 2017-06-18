'use strict';

module.exports = clientErrorHandler;

function clientErrorHandler(maxFileSize) {
  return function (err, req, res, next) {
    logger('clientErrorHandler:', err.message, err.code);

    if(err.code === 'LIMIT_FILE_SIZE')
      res.fail('File too large. Maximum ' + maxFileSize + ' bytes.');

    next(err);
  }
}
