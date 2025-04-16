/*
  Warnings:

  - Added the required column `updatedAt` to the `tree_nodes` table without a default value. This is not possible if the table is not empty.

*/
-- Add category column
ALTER TABLE tree_nodes ADD category VARCHAR(191) NOT NULL DEFAULT 'Kunde';

-- Add timestamps
ALTER TABLE tree_nodes ADD createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tree_nodes ADD updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
ON
UPDATE CURRENT_TIMESTAMP;
