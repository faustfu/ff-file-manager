'use strict';

module.exports = buildModule;

function buildModule(app, env) {
    const db = require('./db')(app, env);

    return {
        file : require('./file')(app, db, env),
    };
}
