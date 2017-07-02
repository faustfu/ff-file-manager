'use strict';

const Database = require('better-sqlite3');
const dbName = 'file-manager.db';

module.exports = buildModule;

function buildModule(app, env) {

  return {
    getConnection: getConnection
  };
}

function getConnection() {
  return new Database(dbName);
}