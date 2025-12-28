-- Add missing fields to existing CaptivePortal table
-- This script adds all the new fields needed for the Captive Portal configuration

ALTER TABLE `CaptivePortal` 
ADD COLUMN `welcomeMessage` TEXT DEFAULT '',
ADD COLUMN `termsOfService` TEXT DEFAULT '',
ADD COLUMN `redirectUrl` VARCHAR(191) DEFAULT NULL,
ADD COLUMN `sessionTimeout` INT DEFAULT 3600,
ADD COLUMN `maxBandwidth` INT DEFAULT 1024,
ADD COLUMN `isActive` TINYINT(1) DEFAULT 1,
ADD COLUMN `logoUrl` VARCHAR(191) DEFAULT '',
ADD COLUMN `welcomeHeading` VARCHAR(191) DEFAULT '',
ADD COLUMN `welcomeText` TEXT DEFAULT '',
ADD COLUMN `hintText` TEXT DEFAULT '',
ADD COLUMN `backgroundColor` VARCHAR(191) DEFAULT '#000000',
ADD COLUMN `backgroundImage` TEXT DEFAULT '',
ADD COLUMN `buttonText` VARCHAR(191) DEFAULT 'Internet',
ADD COLUMN `termsLinkText` VARCHAR(191) DEFAULT '';

-- Rename 'name' column to 'portalName' if needed (or we can map it in Prisma)
-- ALTER TABLE `CaptivePortal` CHANGE COLUMN `name` `portalName` VARCHAR(255) NOT NULL;

