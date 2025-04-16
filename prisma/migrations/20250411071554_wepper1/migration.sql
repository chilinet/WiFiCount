-- DropForeignKey
ALTER TABLE `tree_nodes` DROP FOREIGN KEY `tree_nodes_ibfk_1`;

-- AddForeignKey
ALTER TABLE `tree_nodes` ADD CONSTRAINT `tree_nodes_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `tree_nodes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `tree_nodes` RENAME INDEX `parentId` TO `tree_nodes_parentId_idx`;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `email` TO `users_email_key`;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `username` TO `users_username_key`;
