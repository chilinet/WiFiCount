-- Check what tables exist with "captive" in the name
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME LIKE '%captive%' 
  OR TABLE_NAME LIKE '%Captive%';

