-- Fix backgroundImage column type to TEXT to support large base64 images
-- This script checks if the column exists and changes it to TEXT if it's not already TEXT

SET @dbname = DATABASE();
SET @tablename = 'CaptivePortal';
SET @columnname = 'backgroundImage';

-- Check current column type and change to TEXT if needed
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
      AND (data_type = 'text' OR data_type = 'longtext' OR data_type = 'mediumtext')
  ) > 0,
  'SELECT "Column backgroundImage is already TEXT type" AS message',
  CONCAT('ALTER TABLE ', @tablename, ' MODIFY COLUMN ', @columnname, ' TEXT')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

