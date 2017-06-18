'use strict';

const sql = require('mssql');
const co = require('co');
sql.on('error', onerror);

module.exports = buildModule;

function buildModule(app, env) {
  const config = {
    user: env.setting.dbUser,
    password: env.setting.dbPassword,
    server: env.setting.dbServer,
    port: env.setting.dbPort,
    database: env.setting.dbName,

    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
  };

  return {
    query: co.wrap(query),
    execute: co.wrap(execute)
  };

  function* query(cmd) {
    const result = yield doAction(cmd);

    return result.recordset;
  }

  function* execute(cmd) {
    const result = yield doAction(cmd);

    return result.rowsAffected[0];
  }

  function* doAction(action) {
    let pool = null;

    try {
      sql.close();
      pool = yield sql.connect(config);
      
      return yield pool.request().query(action);
    }
    catch(err) {
      console.log(err);
    } 
    finally {
      if (pool) pool.close();
    }
  }
}

function onerror(err) {
  console.error(err.stack);
}
