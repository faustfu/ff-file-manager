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

const queryStringGetListByProjectIdAndUserId = `
  SELECT * FROM Files
  WHERE
    ProjectId = :ProjectId AND
    UserId = :UserId
  ORDER BY
    UpdateTime DESC
`;

const queryStringGetOneByAK = `
  SELECT * FROM Files
  WHERE
    ProjectId = :ProjectId AND
    UserId = :UserId AND
    FileType = :FileType AND
    FileName = :FileName
`;

const queryStringGetCountByAK = `
  SELECT COUNT(1) AS number FROM Files
  WHERE
    ProjectId = :ProjectId AND
    UserId = :UserId AND
    FileType = :FileType AND
    FileName = :FileName
`;

const insertString = `
  INSERT INTO Files (
    ProjectId,
    UserId,
    FileType,
    FileName,
    URL,
    FileTitle,
    FileSize
  ) values (
    :ProjectId,
    :UserId,
    :FileType,
    :FileName,
    :URL,
    :FileTitle,
    :FileSize
  )
`;

const updateString = `
  UPDATE Files SET
    URL = :URL,
    FileTitle = :FileTitle,
    FileSize = :FileSize,
    UpdateTime = datetime('now')
  WHERE 
    ProjectId = :ProjectId AND
    UserId = :UserId AND
    FileType = :FileType AND
    FileName = :FileName
`;

module.exports = buildModule;

function buildModule(app, db, env) {
  return {
    getList : getList,
    getOne: getOne,
    create : create,
    toJSON : toJSON,
  };

  function getList(username) {
    return fn.promise().then(function() {
      let conn = null;

      try {
        conn = db.getConnection();

        const stmt = conn.prepare(queryStringGetListByProjectIdAndUserId);

        const rows = stmt.all({
          ProjectId: projectIdMapper[env.PROJECT_NAME],
          UserId: username
        });

        fn.debug(rows, 'debug getList)query result');

        return rows;
      } catch(err) {
        fn.log(err, 'error after getList');
      } finally {
        conn.close();
      }
    });
  }

  function getOne(username, fileType, filename) {
    return fn.promise().then(function() {
      let conn = null;

      try {
        conn = db.getConnection();

        const stmt = conn.prepare(queryStringGetOneByAK);

        const row = stmt.get({
          ProjectId: projectIdMapper[env.PROJECT_NAME],
          UserId: username,
          FileType: fileTypeMapper[fileType],
          FileName: filename
        });

        fn.debug(row, 'debug getOne)query result');

        return row;
      } catch(err) {
        fn.log(err, 'error after getOne');
      } finally {
        conn.close();
      }
    });
  }

  function create(username, files, title) {
    return validate(files).then(function(file) {
      let f = fn.clone(file), conditions = {};

      f.type = f.mimetype.split('/')[0];

      if (f.type !== 'image') {
        return fn.reject('unsupported format=' + f.type);
      }

      conditions = {
        projectId: projectIdMapper[env.PROJECT_NAME],
        userId: username,
        fileType: fileTypeMapper[f.type],
        filename: f.originalname
      };

      fn.debug(conditions, 'debug create)before check if existed, conditions');

      return getOne(username, f.type, f.originalname).then(function(result) {
        fn.debug(result, 'debug create)after check if existed, result');
        let conn = null;

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

          try {
            conn = db.getConnection();

            const stmt = conn.prepare(updateString);

            const result = stmt.run({
              ProjectId: conditions.projectId,
              UserId: conditions.userId,
              FileType: conditions.fileType,
              FileName: conditions.filename,
              URL: f.filename,
              FileTitle: title,
              FileSize: f.size
            });

            fn.debug(result, 'debug update)update result');

            return getOne(username, f.type, f.originalname);;
          } catch(err) {
            fn.log(err, 'error after update');
          } finally {
            conn.close();
          }
        } else {
          try {
            conn = db.getConnection();

            const stmt = conn.prepare(insertString);

            const result = stmt.run({
              ProjectId: conditions.projectId,
              UserId: conditions.userId,
              FileType: conditions.fileType,
              FileName: conditions.filename,
              URL: f.filename,
              FileTitle: title,
              FileSize: f.size
            });

            fn.debug(result, 'debug insert)insert result');

            return getOne(username, f.type, f.originalname);;
          } catch(err) {
            fn.log(err, 'error after insert');
          } finally {
            conn.close();
          }
        }
      });
    });
  }

  function count(conditions) {
    return fn.promise().then(function() {
      let conn = null;

      try {
        conn = db.getConnection();

        const stmt = conn.prepare(queryStringGetCountByAK);

        const row = stmt.get({
          ProjectId: conditions.projectId,
          UserId: conditions.userId,
          FileType: conditions.fileType,
          FileName: conditions.filename
        });

        fn.debug(row, 'debug getCount)query result');

        return row.number;
      } catch(err) {
        fn.log(err, 'error after getCount');
      } finally {
        conn.close();
      }
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
