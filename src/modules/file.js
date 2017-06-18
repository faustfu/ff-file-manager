'use strict';

const fs = require('fs');

const fileTypeMapper= {
  image: 1
};

const fileTypeReverseMapper= {
  1: 'image'
};

const projectIdMapper= {
  'MSC': 1,
  'FFF': 2
};

const projectIdReverseMapper= {
  1: 'MSC',
  2: 'FFF'
};

module.exports = buildModule;

function buildModule(app, db, env) {
  return {
    getList : getList,
    getOne: getOne,
    create : create,
    toJSON : toJSON,
  };

  function getList(access_token) {
    const queryString = `
      SELECT *
      FROM dbo.Files
      WHERE
        ProjectId = ${fn.escape(projectIdMapper[env.PROJECT_NAME])} AND
        UserId = ${fn.escape(access_token)}
      ORDER BY
        UpdateTime DESC
    `;

    fn.debug(queryString, 'debug getList)queryString');

    return db.query(queryString);
  }

  function getOne(access_token, fileType, filename) {
    const conditions = {
      projectId: projectIdMapper[env.PROJECT_NAME],
      userId: access_token,
      fileType: fileTypeMapper[fileType],
      filename: filename
    };

    return query(conditions, 2).then(function(results) { //2:all
      return results[0]; //first one
    });
  }

  function create(access_token, files, title) {
    return validate(files).then(function(file) {
      let f = fn.clone(file), conditions = {};

      f.type = f.mimetype.split('/')[0];

      if (f.type !== 'image') {
        return fn.reject('unsupported format=' + f.type);
      }

      conditions = {
        projectId: projectIdMapper[env.PROJECT_NAME],
        userId: access_token,
        fileType: fileTypeMapper[f.type],
        filename: f.originalname
      };

      fn.debug(conditions, 'debug create)before check if existed, conditions');

      return getOne(access_token, f.type, f.originalname).then(function(result) {
        fn.debug(result, 'debug create)after check if existed, result');
        if (result) {
          fs.access(env.setting.uploadDir + result.URL, (err) => {
            if (!err) {
              fs.unlink(env.setting.uploadDir + result.URL, (err) => {
                if (err) {
                  fn.log(err, 'error after unlink file');
                }
              });
            }
          });

          const updateString = `
            UPDATE dbo.Files
            SET
              URL = ${fn.escape(f.filename)},
              FileTitle = ${fn.escape(title)},
              FileSize = ${fn.escape(f.size)},
              UpdateTime = GETDATE()
            WHERE 
              ProjectId = ${fn.escape(conditions.projectId)} AND
              UserId = ${fn.escape(conditions.userId)} AND
              FileType = ${fn.escape(conditions.fileType)} AND
              FileName = ${fn.escape(conditions.filename)}
          `;

          return db.execute(updateString).then(function(result) {
            return getOne(access_token, f.type, f.originalname);
          }).catch(function(err) {
            fn.log(err, 'error after update');
          });
        } else {
          const insertString = `
            INSERT INTO dbo.Files (
              ProjectId,
              UserId,
              FileType,
              FileName,
              URL,
              FileTitle,
              FileSize
            ) values (
              ${fn.escape(conditions.projectId)},
              ${fn.escape(conditions.userId)},
              ${fn.escape(conditions.fileType)},
              ${fn.escape(conditions.filename)},
              ${fn.escape(f.filename)},
              ${fn.escape(title)},
              ${fn.escape(f.size)}
            )
          `;

          return db.execute(insertString).then(function(result) {
            return getOne(access_token, f.type, f.originalname);
          }).catch(function(err) {
            fn.log(err, 'error after create');
          });
        }
      });
    });
  }

  function count(conditions) {
    return query(conditions, 1); //1:count
  }

  function query(conditions, queryType) {
    const selectStatement = queryType === 1 ? 'COUNT(1) AS number' : '*';
    const queryString = `
      SELECT ${selectStatement}
      FROM dbo.Files
      WHERE
        ProjectId = ${fn.escape(conditions.projectId)} AND
        UserId = ${fn.escape(conditions.userId)} AND
        FileType = ${fn.escape(conditions.fileType)} AND
        FileName = ${fn.escape(conditions.filename)}
    `;

    return db.query(queryString).then(function(result) {
      return queryType === 1 ? result[0].number : result;
    });
  }

  function toJSON(row) {
    return {
      projectName: projectIdReverseMapper[row.ProjectId],
      userId: row.UserId,
      fileType: fileTypeReverseMapper[row.FileType],
      filename: row.FileName,
      url: env.uploadUrl + row.URL,
      fileTitle: row.FileTitle,
      fileSize: row.FileSize,
      createTime: row.CreateTime,
      updateTime: row.UpdateTime
    };
  }

  function validate(files) {
    if (!fn.existy(files) || _.size(files) <= 0) return fn.reject('empty or unknown file');

    return fn.promise(files[0]);
  }
}
