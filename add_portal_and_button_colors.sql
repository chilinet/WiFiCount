-- Add portalBackgroundColor and buttonColor columns to CaptivePortal table

ALTER TABLE `CaptivePortal` 
ADD COLUMN `portalBackgroundColor` VARCHAR(191) DEFAULT '#111111',
ADD COLUMN `buttonColor` VARCHAR(191) DEFAULT '#ff9800';

