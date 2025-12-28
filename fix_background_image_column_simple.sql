-- Fix backgroundImage column type to TEXT to support large base64 images
-- Simple version: directly modify the column

ALTER TABLE `CaptivePortal` 
MODIFY COLUMN `backgroundImage` TEXT;

