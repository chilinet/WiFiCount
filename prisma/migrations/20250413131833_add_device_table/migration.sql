-- CreateTable
CREATE TABLE `Device` (
    `id` VARCHAR(191) NOT NULL,
    `macAddress` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Device_areaId_idx`(`areaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Device` ADD CONSTRAINT `Device_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `TreeNode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `TreeNode` RENAME INDEX `TreeNode_parentId_fkey` TO `TreeNode_parentId_idx`;
