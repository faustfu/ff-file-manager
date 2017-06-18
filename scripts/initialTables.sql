USE master
GO
--
IF NOT EXISTS (
   SELECT name
   FROM sys.databases
   WHERE name = N'MSC_UploadFiles'
)
CREATE DATABASE [MSC_UploadFiles]
GO
--
USE MSC_UploadFiles
GO
--
IF OBJECT_ID('dbo.Files', 'U') IS NOT NULL
DROP TABLE dbo.Files
GO
--
CREATE TABLE dbo.Files
(
   ProjectId INT NOT NULL,
   UserId [NVARCHAR](100) NOT NULL,
   FileType INT NOT NULL,
   FileName [NVARCHAR](200) NOT NULL,
   URL [NVARCHAR](1000) NOT NULL,
   FileTitle [NVARCHAR](100) DEFAULT '',
   FileSize NUMERIC(18,0) DEFAULT 0,
   CreateTime DATETIME NOT NULL DEFAULT GETDATE()

   CONSTRAINT PK_Files PRIMARY KEY NONCLUSTERED ([ProjectId], [UserId], [FileType], [FileName])
)
GO
--
ALTER TABLE dbo.Files ADD UpdateTime DATETIME NOT NULL DEFAULT GETDATE()
GO
