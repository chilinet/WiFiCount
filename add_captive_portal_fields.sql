-- Add new fields to CaptivePortalConfig table
-- Note: Run each ALTER TABLE statement separately if a column already exists
-- MySQL doesn't support IF NOT EXISTS for ADD COLUMN

ALTER TABLE CaptivePortalConfig 
ADD COLUMN logoUrl VARCHAR(191) DEFAULT '',
ADD COLUMN welcomeHeading VARCHAR(191) DEFAULT '',
ADD COLUMN welcomeText TEXT DEFAULT '',
ADD COLUMN hintText TEXT DEFAULT '',
ADD COLUMN backgroundColor VARCHAR(191) DEFAULT '#000000',
ADD COLUMN backgroundImage TEXT DEFAULT '',
ADD COLUMN buttonText VARCHAR(191) DEFAULT 'Internet',
ADD COLUMN termsLinkText VARCHAR(191) DEFAULT '';

-- Make redirectUrl nullable (if it's not already nullable)
ALTER TABLE CaptivePortalConfig 
MODIFY COLUMN redirectUrl VARCHAR(191) NULL;
