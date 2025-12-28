-- Create captiveportalconfig table if it doesn't exist
-- This matches the Prisma schema with lowercase table name

CREATE TABLE IF NOT EXISTS `captiveportalconfig` (
  `id` varchar(191) NOT NULL,
  `nodeId` varchar(191) NOT NULL,
  `portalName` varchar(191) NOT NULL,
  `welcomeMessage` text NOT NULL DEFAULT '',
  `termsOfService` text NOT NULL DEFAULT '',
  `redirectUrl` varchar(191) DEFAULT NULL,
  `sessionTimeout` int NOT NULL DEFAULT 3600,
  `maxBandwidth` int NOT NULL DEFAULT 1024,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `logoUrl` varchar(191) DEFAULT '',
  `welcomeHeading` varchar(191) DEFAULT '',
  `welcomeText` text DEFAULT '',
  `hintText` text DEFAULT '',
  `backgroundColor` varchar(191) DEFAULT '#000000',
  `backgroundImage` text DEFAULT '',
  `buttonText` varchar(191) DEFAULT 'Internet',
  `termsLinkText` varchar(191) DEFAULT '',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `captiveportalconfig_nodeId_idx` (`nodeId`),
  CONSTRAINT `captiveportalconfig_nodeId_fkey` FOREIGN KEY (`nodeId`) REFERENCES `TreeNode` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

