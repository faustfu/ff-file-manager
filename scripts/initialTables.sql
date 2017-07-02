--
DROP TABLE Files;
--
CREATE TABLE Files (
   ProjectId INTEGER NOT NULL,
   UserId TEXT NOT NULL,
   FileType INTEGER NOT NULL,
   FileName TEXT NOT NULL,
   URL TEXT NOT NULL,
   FileTitle TEXT DEFAULT '',
   FileSize INTEGER DEFAULT 0,
   CreateTime TEXT NOT NULL DEFAULT (datetime('now')),
   UpdateTime TEXT NOT NULL DEFAULT (datetime('now')),
   
   PRIMARY KEY (ProjectId, UserId, FileType, FileName)
);
