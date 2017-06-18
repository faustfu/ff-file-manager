'use strict';

let lut = [];
for (let i = 0; i < 256; i++) {
    lut[i] = ( i < 16 ? '0' : '' ) + (i).toString(16);
}

const moment = require('moment');
const clone = require('clone');
const json = require('json3');
const prettyjson = require('prettyjson');
const sqlstring = require('./sqlstring');
const resHelper = require('./res');

const m = {
    promise : promise,
    reject : reject,
    all : all,
    existy : existy,
    truthy : truthy,
    partial1 : partial1,
    clone : clone,
    json : json,
    moment : moment,
    bcrypt : require('bcrypt'),
    uuid : uuid,
    resHelper : resHelper,
    respondSend : respondSend,
    respondFail : respondFail,
    construct : construct,
    escape: sqlstring.escape,
    log: log,
    debug: debug
};

module.exports = m;

function promise(x) {
    return Promise.resolve(x);
}

function reject(x) {
    return Promise.reject(x);
}

function all(x) {
    return Promise.all(x);
}

function existy(x) {
    return x != null;
}

function truthy(x) {
    return (x !== false) && existy(x);
}

function partial1(fun, arg1) {
    return function() {
        var args = construct(arg1, arguments);
        return fun.apply(fun, args);
    };
}

function uuid() {
    var d0 = Math.random()*0xffffffff | 0;
    var d1 = Math.random()*0xffffffff | 0;
    var d2 = Math.random()*0xffffffff | 0;
    var d3 = Math.random()*0xffffffff | 0;
    return lut[d0 & 0xff] + lut[d0>>8 & 0xff] + lut[d0>>16 & 0xff] + lut[d0>>24 & 0xff] + '-' +
        lut[d1 & 0xff] + lut[d1>>8 & 0xff] + '-' + lut[d1>>16 & 0x0f | 0x40] + lut[d1>>24 & 0xff] + '-' +
        lut[d2 & 0x3f | 0x80] + lut[d2>>8 & 0xff] + '-' + lut[d2>>16 & 0xff] + lut[d2>>24 & 0xff] +
        lut[d3 & 0xff] + lut[d3>>8 & 0xff] + lut[d3>>16 & 0xff] + lut[d3>>24 & 0xff];
}

function respondSend(req, res) {
    return function(data) {
        resHelper(req, res).send(data);
    }
}

function respondFail(req, res) {
    return function(error) {
        resHelper(req, res).fail(error);
    }
}

function construct(head, tail) {
    return cat([head], _.toArray(tail));
}

//private functions
function cat(head) {
    if (existy(head)) {
        return head.concat.apply(head, _.rest(arguments));
    } else {
        return [];
    }
}

function log(content, prompt) {
    if (prompt) {
        console.log(`<${prompt}>`);
    }

    console.log(pretty(content));
}

function debug(content, prompt) {
    if (process.env.NODE_ENV === 'dev') {
        log(content, prompt);
    }
}

function pretty(content) {
    return prettyjson.render(content || {});
}
