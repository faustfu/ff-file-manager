'use strict';

/**
 * Dependencies
 */

const dev = require('./env/dev');
const test = require('./env/test');
const prod = require('./env/prod');
const extend = require('util')._extend;

const defaults = {
    maxFileSize: 20*1024*1024,   // upload limits, bytes
    apiPath: '/api',
    uploadPath: '/uploads/',
    uploadDir: __base + '/public/uploads/'
};

const QUERY_LIMIT = 20;
const PROJECT_NAME = 'FFF';

/**
 * Transform
 */

const setting = {
    dev: extend(dev, defaults),
    test: extend(test, defaults),
    prod: extend(prod, defaults)
}[process.env.NODE_ENV || 'dev'];

var ret = {};

ret.publicHostUrl = setting.publicHostUrl;
ret.uploadUrl = setting.publicHostUrl + setting.uploadPath;
ret.publicApiUrl = setting.publicHostUrl + setting.apiPath;
ret.setting = setting;
ret.QUERY_LIMIT = QUERY_LIMIT;
ret.PROJECT_NAME = PROJECT_NAME;

/**
 * Expose
 */

module.exports = ret;
