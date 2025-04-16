/*
  Warnings:

  - You are about to drop the `tree_nodes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `tree_nodes` DROP FOREIGN KEY `tree_nodes_parentId_fkey`;

-- DropTable
DROP TABLE `tree_nodes`;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `TreeNode` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TreeNode` ADD CONSTRAINT `TreeNode_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `TreeNode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
