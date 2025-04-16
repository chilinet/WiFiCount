-- MySQL dump 10.13  Distrib 8.0.40, for macos12.7 (arm64)
--
-- Host: localhost    Database: wepper
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('4b76054e-2173-4094-8796-80735dcd53d6','7e54b6eeacfd80239d84631605510efc6652d227f6ca51a590d3c6815e16449e','2025-04-12 19:21:33.417','20250411075010_add_category_field',NULL,NULL,'2025-04-12 19:21:33.406',1),('5b0db8c0-bbcd-4c87-83e5-a77e0e7044be','750be9327888da8f18562f9b4abafc0c849a8c2490cd1b8a7549cf4bd9a9aa65','2025-04-12 19:22:04.177','20250412192204_create_user_table',NULL,NULL,'2025-04-12 19:22:04.169',1),('81483ee2-d0a1-422b-a8b5-a751713cc3b0','25faaf5a90bc42af7dced1965b2f8d56d2738c62e2c9e90d22de3b67f08acfe5','2025-04-13 13:18:33.858','20250413131833_add_device_table',NULL,NULL,'2025-04-13 13:18:33.836',1),('8964d0ef-88d0-4461-85b6-31c76e71e4e3','113bfdafbb6f5cc7410fb3576b346e744747da80e6c462206f490733ddb6e0be','2025-04-12 19:21:33.405','20250411071554_wepper1',NULL,NULL,'2025-04-12 19:21:33.378',1),('a98a1ed8-fc26-406c-a0d1-4f0e41fbd761','1a4b6363415c7c8c1fdcefa129ff24c92c7bc784b1d25eee0595e44f6efef848','2025-04-12 19:21:33.377','20250411070205_init',NULL,NULL,'2025-04-12 19:21:33.313',1),('bfcf2599-3a44-4cc0-9ee2-9a253df40795','42762169544bc71411d6e1801aafdefe09673d10fc67f93f9c8d8b815f26429e','2025-04-12 19:21:33.432','20250411075048_nr_2',NULL,NULL,'2025-04-12 19:21:33.417',1),('d2cfb97c-fd56-4d82-8fcc-cb622f5e31aa','962991809718a6d8692c418e4eaed36d4db7791020ecc7066efb9fc66fc77262',NULL,'20250415184624_add_node_id_to_user','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250415184624_add_node_id_to_user\n\nDatabase error code: 1265\n\nDatabase error:\nData truncated for column \'role\' at row 2\n\nPlease check the query number 3 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20250415184624_add_node_id_to_user\"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20250415184624_add_node_id_to_user\"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:225',NULL,'2025-04-15 18:46:25.095',0),('e279fba5-829a-42c4-9d82-6868fba33453','459b9c3820f10f115e22c513c62d79905d2f4293b6343f65e461e97bdd8035a4','2025-04-12 19:21:33.458','20250412191352_create_user_table',NULL,NULL,'2025-04-12 19:21:33.432',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Device`
--

DROP TABLE IF EXISTS `Device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Device` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `macAddress` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `areaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Device_areaId_idx` (`areaId`),
  CONSTRAINT `Device_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `TreeNode` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Device`
--

LOCK TABLES `Device` WRITE;
/*!40000 ALTER TABLE `Device` DISABLE KEYS */;
INSERT INTO `Device` VALUES ('cm9fov7hy000dit39hxjviyxp','58:C1:7A:8F:16:90','Kasse AP','cm9fmyebu000nitmz3n166yun','2025-04-13 13:36:50.614','2025-04-13 13:36:50.614'),('cm9g314510003itiyj39k5xnn','BC:E6:7C:30:69:3E','Stellplatz','cm9g302uv0001itiy08wmx63j','2025-04-13 20:13:20.821','2025-04-13 20:13:20.821'),('cm9g321vj0005itiyrwwvp2u5','58:C1:7A:8F:16:90','Wiese','cm9foms510007it39br16zb5k','2025-04-13 20:14:04.543','2025-04-13 20:14:04.543'),('cm9g5i41j000bitiy34p1orr8','BC:A9:93:5F:AC:2C','AP07','cm9g5etnm0009itiy6u5t2gx5','2025-04-13 21:22:33.080','2025-04-13 21:22:33.080'),('cm9gnvi81000hitiy9vgwaraq','BC:A9:93:5F:AC:1B','Bürgerhaus Wachenbuchen','cm9gnuwxc000fitiywdivha1p','2025-04-14 05:56:51.073','2025-04-14 05:56:51.073'),('cm9gxmibo000jitiyer868vqr','BC:A9:93:5A:7C:90','Bürgerhaus Wachenbuchen 2,4 Gkz','cm9gnuwxc000fitiywdivha1p','2025-04-14 10:29:47.460','2025-04-14 10:29:47.460'),('cm9gxmwwa000litiyfqyatm2c','BC:A9:93:5A:7C:80','Bürgerhaus Wachenbuchen 5Ghz','cm9gnuwxc000fitiywdivha1p','2025-04-14 10:30:06.344','2025-04-14 10:30:06.344'),('cm9gxr1iq000ritiytwy1fakv','BC:A9:93:5F:AC:A7','AP02','cm9gxq2jw000pitiyk2x4ng6i','2025-04-14 10:33:18.962','2025-04-14 10:33:18.962'),('cm9gz410n000xitiyd7awpqtd','F0-3E-90-21-61-EC','Marktplatz am Rathaus','cm9gz3ner000vitiy2pgxk4zt','2025-04-14 11:11:24.455','2025-04-14 11:11:24.455'),('cm9gzfyws001litiyr9fvcgvd','BC-E6-7C-EB-9A-1A','Apollotheater AP09','cm9gzevpt001fitiyr6ctzxft','2025-04-14 11:20:41.596','2025-04-14 11:20:41.596'),('cm9gznaij001nitiyaf3v8y74','BC:A9:93:63:A4:68','Apollotheater AP10','cm9gzevpt001fitiyr6ctzxft','2025-04-14 11:26:23.225','2025-04-14 11:26:23.225'),('cm9gzphcm001pitiy22g960k3','30:CB:C7:2C:F2:80','Laterne 1','cm9gzf6rs001hitiyg1whmkcf','2025-04-14 11:28:05.399','2025-04-14 11:28:05.399'),('cm9gzpt4c001ritiy32ndwefx','30:CB:C7:2C:F2:92','Laterne 2','cm9gzf6rs001hitiyg1whmkcf','2025-04-14 11:28:20.652','2025-04-14 11:28:20.652'),('cm9gzq1uq001titiy35wa1f8j','30:CB:C7:2C:F3:B2','Laterne 3','cm9gzf6rs001hitiyg1whmkcf','2025-04-14 11:28:31.970','2025-04-14 11:28:31.970'),('cm9gzqd97001vitiy7frxuz09','30:CB:C7:2C:CB:4E','Laterne 4','cm9gzf6rs001hitiyg1whmkcf','2025-04-14 11:28:46.747','2025-04-14 11:28:46.747'),('cm9gzqou5001xitiyhlwbdx8c','30:CB:C7:2C:F3:BC','Laterne 5','cm9gzf6rs001hitiyg1whmkcf','2025-04-14 11:29:01.758','2025-04-14 11:29:01.758'),('cm9gzwhcp001zitiyqvr10xwz','BC:A9:93:63:BB:D0','ZOB-AP07','cm9gzffbz001jitiyjuwqe009','2025-04-14 11:33:31.993','2025-04-14 11:34:39.270'),('cm9gzx5tw0021itiycpc7vvzn','BC:E6:7C:52:2D:E0','ZOB-AP06','cm9gzffbz001jitiyjuwqe009','2025-04-14 11:34:03.717','2025-04-14 11:34:03.717'),('cm9gzxrs20023itiyjt1eqcyc','BC:A9:93:63:A3:92','ZOB-AP08','cm9gzffbz001jitiyjuwqe009','2025-04-14 11:34:32.162','2025-04-14 11:34:32.162'),('cm9ijy6wo000f2p6w5s6uv2wm','BC-A9-93-5F-C4-9C','AP01 Gemeindehaus','cm9ijubu300072p6wio9ufrdl','2025-04-15 13:42:30.264','2025-04-15 13:42:30.264'),('cm9ikcq92000h2p6wrtcy0yrx','F0-3E-90-04-DA-A8','Gerät 1','cm9iju70g00052p6w6zow88wh','2025-04-15 13:53:48.518','2025-04-15 13:53:48.518'),('cm9ikd51g000j2p6wfu95wjps','F0-3E-90-04-DA-AC','Gerät 2','cm9iju70g00052p6w6zow88wh','2025-04-15 13:54:07.684','2025-04-15 13:54:07.684'),('cm9ikdhwe000l2p6w7uwvt9yu','F0-3E-90-21-5E-9C','Gerät 3','cm9iju70g00052p6w6zow88wh','2025-04-15 13:54:24.350','2025-04-15 13:54:24.350'),('cm9ikg18m000n2p6wwfa5k7ok','1C-B9-C4-04-60-38','Gerät 4','cm9iju70g00052p6w6zow88wh','2025-04-15 13:56:22.726','2025-04-15 13:56:22.726'),('cm9ikg84s000p2p6wwudwxvra','F0-3E-90-21-5E-98','Gerät 5','cm9iju70g00052p6w6zow88wh','2025-04-15 13:56:31.661','2025-04-15 13:56:31.661'),('cm9ikgh20000r2p6whtbpj7ij','E8-1D-A8-23-B4-18','Gerät 6','cm9iju70g00052p6w6zow88wh','2025-04-15 13:56:43.224','2025-04-15 13:56:43.224'),('cm9ikgqc2000t2p6w9u8t32vu','F0-3E-90-04-CD-8C','Gerät 7','cm9iju70g00052p6w6zow88wh','2025-04-15 13:56:55.250','2025-04-15 13:56:55.250'),('cm9ikgyfo000v2p6w0rt8p94z','F0-3E-90-04-CD-88','Gerät 8','cm9iju70g00052p6w6zow88wh','2025-04-15 13:57:05.748','2025-04-15 13:57:05.748'),('cm9ikh9zp000x2p6wg46aef2s','1C-B9-C4-04-60-3C','Gerät 9','cm9iju70g00052p6w6zow88wh','2025-04-15 13:57:20.725','2025-04-15 13:57:20.725'),('cm9ikhhqe000z2p6whyscde5p','E8-1D-A8-23-C9-18','Gerät 10','cm9iju70g00052p6w6zow88wh','2025-04-15 13:57:30.758','2025-04-15 13:57:30.758'),('cm9ikhrel00112p6wohap1x0h','E8-1D-A8-23-C9-1C','Gerät 11','cm9iju70g00052p6w6zow88wh','2025-04-15 13:57:43.293','2025-04-15 13:57:43.293'),('cm9ikhz5a00132p6wtgix3a9t','E8-1D-A8-23-B4-1C','Gerät 12','cm9iju70g00052p6w6zow88wh','2025-04-15 13:57:53.326','2025-04-15 13:57:53.326');

/*!40000 ALTER TABLE `Device` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TreeNode`
--

DROP TABLE IF EXISTS `TreeNode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TreeNode` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('ROOT','KUNDE','STANDORT','BEREICH') COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `TreeNode_parentId_idx` (`parentId`),
  CONSTRAINT `TreeNode_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `TreeNode` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TreeNode`
--

LOCK TABLES `TreeNode` WRITE;
/*!40000 ALTER TABLE `TreeNode` DISABLE KEYS */;
INSERT INTO `TreeNode` VALUES ('cm9flehli0003itl8m911dt7d','Chilinet','ROOT',NULL,'2025-04-13 11:59:51.703','2025-04-13 12:30:40.095'),('cm9fmhfkz0005itmzoj0r4yhy','Bad Orb','KUNDE','cm9flehli0003itl8m911dt7d','2025-04-13 12:30:08.676','2025-04-13 13:29:24.477'),('cm9fmoirm000fitmzgz9lrdgc','Stadt Butzbach','KUNDE','cm9flehli0003itl8m911dt7d','2025-04-13 12:35:39.394','2025-04-14 11:10:38.615'),('cm9fmy4g1000litmzyrjb768m','Freibad','STANDORT','cm9fmhfkz0005itmzoj0r4yhy','2025-04-13 12:43:07.393','2025-04-13 13:29:34.479'),('cm9fmyebu000nitmz3n166yun','Kasse','BEREICH','cm9fmy4g1000litmzyrjb768m','2025-04-13 12:43:20.202','2025-04-13 13:30:04.248'),('cm9fn26li000pitmzu5frz0ay','Stadt Maintal','KUNDE','cm9flehli0003itl8m911dt7d','2025-04-13 12:46:16.806','2025-04-13 21:19:26.789'),('cm9fom5pb0005it39sja8vw3z','Wohnmobilstellplatz','STANDORT','cm9fmhfkz0005itmzoj0r4yhy','2025-04-13 13:29:48.384','2025-04-13 13:38:19.319'),('cm9foms510007it39br16zb5k','Wiese','BEREICH','cm9fmy4g1000litmzyrjb768m','2025-04-13 13:30:17.462','2025-04-13 13:30:23.816'),('cm9g302uv0001itiy08wmx63j','Stellplatz','BEREICH','cm9fom5pb0005it39sja8vw3z','2025-04-13 20:12:32.502','2025-04-13 20:12:54.446'),('cm9g5elxk0007itiyfj11383z','Rathaus ','STANDORT','cm9fn26li000pitmzu5frz0ay','2025-04-13 21:19:49.640','2025-04-14 05:56:13.315'),('cm9g5etnm0009itiy6u5t2gx5','AP07','BEREICH','cm9g5elxk0007itiyfj11383z','2025-04-13 21:19:59.650','2025-04-13 21:19:59.650'),('cm9gnujvc000ditiyxfr61sr7','Bürgerhaus Wachenbuchen','STANDORT','cm9fn26li000pitmzu5frz0ay','2025-04-14 05:56:06.552','2025-04-14 05:56:06.552'),('cm9gnuwxc000fitiywdivha1p','AP01','BEREICH','cm9gnujvc000ditiyxfr61sr7','2025-04-14 05:56:23.473','2025-04-14 05:56:23.473'),('cm9gxpkue000nitiyod0pc9x6','Maintal Halle','STANDORT','cm9fn26li000pitmzu5frz0ay','2025-04-14 10:32:10.695','2025-04-14 10:32:15.666'),('cm9gxq2jw000pitiyk2x4ng6i','AP02','BEREICH','cm9gxpkue000nitiyod0pc9x6','2025-04-14 10:32:33.644','2025-04-14 10:32:51.130'),('cm9gz3bdc000titiyp0kgasz2','Rathaus','STANDORT','cm9fmoirm000fitmzgz9lrdgc','2025-04-14 11:10:51.217','2025-04-14 11:10:51.217'),('cm9gz3ner000vitiy2pgxk4zt','Marktplatz','BEREICH','cm9gz3bdc000titiyp0kgasz2','2025-04-14 11:11:06.819','2025-04-14 11:11:06.819'),('cm9gz7isv000zitiyh3y75jsd','Stadt Siegen','KUNDE','cm9flehli0003itl8m911dt7d','2025-04-14 11:14:07.472','2025-04-14 11:14:07.472'),('cm9gz7wl20011itiyv3nwbvn9','Freibäder','STANDORT','cm9gz7isv000zitiyh3y75jsd','2025-04-14 11:14:25.334','2025-04-14 11:14:30.958'),('cm9gz8ot30015itiyl3m4o5jp','Freibad 1','BEREICH','cm9gz7wl20011itiyv3nwbvn9','2025-04-14 11:15:01.911','2025-04-14 11:15:01.911'),('cm9gz8tsc0017itiyxq5tu7fl','Freibad 2','BEREICH','cm9gz7wl20011itiyv3nwbvn9','2025-04-14 11:15:08.364','2025-04-14 11:15:08.364'),('cm9gz964o0019itiyz2zmnokh','ZOB Busbahnhof','STANDORT','cm9gz7isv000zitiyh3y75jsd','2025-04-14 11:15:24.361','2025-04-14 11:15:57.396'),('cm9gz9qjy001bitiypn2ate3i','Herrengarten','STANDORT','cm9gz7isv000zitiyh3y75jsd','2025-04-14 11:15:50.831','2025-04-14 11:15:53.949'),('cm9gzarc4001ditiynt5bhdv4','Apollo Theater','STANDORT','cm9gz7isv000zitiyh3y75jsd','2025-04-14 11:16:38.501','2025-04-14 11:16:38.501'),('cm9gzevpt001fitiyr6ctzxft','Dach','BEREICH','cm9gzarc4001ditiynt5bhdv4','2025-04-14 11:19:50.801','2025-04-14 11:19:50.801'),('cm9gzf6rs001hitiyg1whmkcf','Herrengarten','BEREICH','cm9gz9qjy001bitiypn2ate3i','2025-04-14 11:20:05.129','2025-04-14 11:20:09.643'),('cm9gzffbz001jitiyjuwqe009','Wartebereich','BEREICH','cm9gz964o0019itiyz2zmnokh','2025-04-14 11:20:16.223','2025-04-14 11:33:11.212'),('cm9ijtpik00012p6w45mdcjf9','JZ-Tempel','KUNDE','cm9flehli0003itl8m911dt7d','2025-04-15 13:39:01.099','2025-04-15 13:39:01.099'),('cm9iju70g00052p6w6zow88wh','Tempel','BEREICH','cm9ijtpik00012p6w45mdcjf9','2025-04-15 13:39:23.777','2025-04-15 13:41:59.935'),('cm9ijubu300072p6wio9ufrdl','Gemeindehaus','BEREICH','cm9ijtpik00012p6w45mdcjf9','2025-04-15 13:39:30.028','2025-04-15 13:41:52.488'),('cm9ijw2yd000b2p6wwts2677b','Aussen','BEREICH','cm9ijtpik00012p6w45mdcjf9','2025-04-15 13:40:51.829','2025-04-15 13:40:58.815');
/*!40000 ALTER TABLE `TreeNode` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'User',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `nodeId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('cm9els6n20005ity008d3s17b','test@example.com','Test User','$2b$12$jpYN6PvN.pvrBSC5tQ0sfuh1gUhaqlierSNwtyfB/nmR1DYqpR.fy','admin','testuser','2025-04-12 19:22:44.510','2025-04-13 07:20:08.339','cm9gz7isv000zitiyh3y75jsd'),('cm9fbb8up0002it3bo2y5tlio','stefan@heatmanager.de','stefan','$2b$10$N353kdht7C.dXRQ0OQKgAuP/H./HUJpsy0RySVN05tPKNVkWbvSea','SuperAdmin','stefanluther','2025-04-13 07:17:24.241','2025-04-13 07:19:55.426',NULL),('cm9fbheu10003it3bxc8mkvvh','sluther@chilinet.solutions','sluther','$2b$10$o7Av58u6eTMhHvUdaPp8FOpWzUZX8HbunehdVm01ZTpqg9WIh.NVG','User','fsdgsdgf','2025-04-13 07:22:11.929','2025-04-13 07:23:54.815',NULL),('cm9fbjx0m0004it3bar5p7glo','ffff@hsfgjdg.de','ffff','$2b$10$MnDsKYKi5uH5ysCLd2NsPOfLFmiDt7aaHDxEDwFBxzrV0FSwMt6Wu','User','gdfgdfgd','2025-04-13 07:24:08.806','2025-04-13 07:24:08.806',NULL);
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-15 21:53:28
