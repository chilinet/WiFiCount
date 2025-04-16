/*
  Warnings:

  - You are about to alter the column `category` on the `TreeNode` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- DropIndex
DROP INDEX `User_username_key` ON `User`;

-- AlterTable
ALTER TABLE `TreeNode` MODIFY `category` ENUM('ROOT', 'KUNDE', 'STANDORT', 'BEREICH') NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `username`,
    ADD COLUMN `emailVerified` DATETIME(3) NULL,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `nodeId` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL,
    MODIFY `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_nodeId_fkey` FOREIGN KEY (`nodeId`) REFERENCES `TreeNode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
