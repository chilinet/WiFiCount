-- MySQL dump 10.13  Distrib 8.0.40, for macos12.7 (arm64)
--
-- Host: localhost    Database: wificnt
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
  `finished_at` datetime(6) DEFAULT NULL,
  `migration_name` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` longtext COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(6) DEFAULT NULL,
  `started_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `applied_steps_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('','',NULL,'',NULL,NULL,'0000-00-00 00:00:00.000000',0),('(3 rows affected)','',NULL,'',NULL,NULL,'0000-00-00 00:00:00.000000',0),('e042fc7c-4621-43f4-b4b7-37bd3b516aed','783d07684f25561c9edf708765202a913e27adbc72a7d3aaf8372cfebd54831b','2025-04-20 11:40:29.733628','init-baseline','','0000-00-00 00:00:00.000000','2025-04-20 11:40:29.733628',0),('fc06e46e-4943-4a32-af31-fdbdc634d22c','8807d6c685d7298e24e364bb2b7c34b2442bb21bb7e1f3027995b57daaf6bcfe','2025-04-22 08:34:35.293147','20250422083433_add_captive_portal_relation','NULL','0000-00-00 00:00:00.000000','2025-04-22 08:34:35.076708',1),('ffa6b8b0-37e2-4978-ac9a-98a00d5573ac','99fe3697c21db26d06137d5d10617018ad9b13c1d3978ad0b3a5bfd8bccc1002','2025-04-20 11:47:43.330666','20250420114740_add_captive_portal','NULL','0000-00-00 00:00:00.000000','2025-04-20 11:47:43.082455',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CaptivePortal`
--

DROP TABLE IF EXISTS `CaptivePortal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CaptivePortal` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nodeId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CaptivePortal_name_key` (`name`),
  KEY `CaptivePortal_nodeId_idx` (`nodeId`),
  CONSTRAINT `CaptivePortal_nodeId_fkey` FOREIGN KEY (`nodeId`) REFERENCES `TreeNode` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CaptivePortal`
--

LOCK TABLES `CaptivePortal` WRITE;
/*!40000 ALTER TABLE `CaptivePortal` DISABLE KEYS */;
INSERT INTO `CaptivePortal` VALUES ('','',NULL,NULL,'2025-09-08 19:15:38.000000','2025-09-08 19:15:38.000000'),('cm9s95wdd0000e8ql8l8852nc','fsdfs','fsdf','NULL','2025-04-22 08:38:15.842000','2025-04-22 08:38:15.842000');
/*!40000 ALTER TABLE `CaptivePortal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Device`
--

DROP TABLE IF EXISTS `Device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Device` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `macAddress` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `areaId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Device_areaId_idx` (`areaId`),
  CONSTRAINT `Device_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `TreeNode` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Device`
--

LOCK TABLES `Device` WRITE;
/*!40000 ALTER TABLE `Device` DISABLE KEYS */;
INSERT INTO `Device` VALUES ('cm9fov7hy000dit39hxjviyxp','58:C1:7A:8F:16:90','Kasse AP','cm9fmyebu000nitmz3n166yun','2025-04-13 13:36:50.614000','2025-04-13 13:36:50.614000'),('cm9g314510003itiyj39k5xnn','BC:E6:7C:30:69:3E','Stellplatz','cm9g302uv0001itiy08wmx63j','2025-04-13 20:13:20.821000','2025-04-13 20:13:20.821000'),('cm9g321vj0005itiyrwwvp2u5','58:C1:7A:8F:16:90','Wiese','cm9foms510007it39br16zb5k','2025-04-13 20:14:04.543000','2025-04-13 20:14:04.543000'),('cm9g5i41j000bitiy34p1orr8','BC:A9:93:5F:AC:2C','AP07','cm9g5etnm0009itiy6u5t2gx5','2025-04-13 21:22:33.080000','2025-04-13 21:22:33.080000'),('cm9gnvi81000hitiy9vgwaraq','BC:A9:93:5F:AC:1B','Bürgerhaus Wachenbuchen','cm9gnuwxc000fitiywdivha1p','2025-04-14 05:56:51.073000','2025-04-14 05:56:51.073000'),('cm9gxmibo000jitiyer868vqr','BC:A9:93:5A:7C:90','Bürgerhaus Wachenbuchen 2,4 Gkz','cm9gnuwxc000fitiywdivha1p','2025-04-14 10:29:47.460000','2025-04-14 10:29:47.460000'),('cm9gxmwwa000litiyfqyatm2c','BC:A9:93:5A:7C:80','Bürgerhaus Wachenbuchen 5Ghz','cm9gnuwxc000fitiywdivha1p','2025-04-14 10:30:06.344000','2025-04-14 10:30:06.344000'),('cm9gxr1iq000ritiytwy1fakv','BC:A9:93:5F:AC:A7','AP02','cm9gxq2jw000pitiyk2x4ng6i','2025-04-14 10:33:18.962000','2025-04-14 10:33:18.962000'),('cm9gz410n000xitiyd7awpqtd','F0-3E-90-21-61-EC','Marktplatz am Rathaus','cm9gz3ner000vitiy2pgxk4zt','2025-04-14 11:11:24.455000','2025-04-14 11:11:24.455000'),('cm9gzfyws001litiyr9fvcgvd','BC-E6-7C-EB-9A-1A','Apollotheater AP09','cm9gzevpt001fitiyr6ctzxft','2025-04-14 11:20:41.596000','2025-04-14 11:20:41.596000'),('cm9gznaij001nitiyaf3v8y74','BC:A9:93:63:A4:68','Apollotheater AP10','cm9gzevpt001fitiyr6ctzxft','2025-04-14 11:26:23.225000','2025-04-14 11:26:23.225000'),('cm9gzphcm001pitiy22g960k3','30:CB:C7:2C:F2:80','Laterne 1','cm9gzf6rs001hitiyg1whmkcf','2025-04-14 11:28:05.399000','2025-04-14 11:28:05.399000'),('cm9gzpt4c001ritiy32ndwefx','30:CB:C7:2C:F2:92','Laterne 2','cm9gzf6rs001hitiyg1whmkcf','2025-04-14 11:28:20.652000','2025-04-14 11:28:20.652000'),('cm9gzq1uq001titiy35wa1f8j','30:CB:C7:2C:F3:B2','Laterne 3','cm9gzf6rs001hitiyg1whmkcf','2025-04-14 11:28:31.970000','2025-04-14 11:28:31.970000'),('cm9gzqd97001vitiy7frxuz09','30:CB:C7:2C:CB:4E','Laterne 4','cm9gzf6rs001hitiyg1whmkcf','2025-04-14 11:28:46.747000','2025-04-14 11:28:46.747000'),('cm9gzqou5001xitiyhlwbdx8c','30:CB:C7:2C:F3:BC','Laterne 5','cm9gzf6rs001hitiyg1whmkcf','2025-04-14 11:29:01.758000','2025-04-14 11:29:01.758000'),('cm9gzwhcp001zitiyqvr10xwz','BC:A9:93:63:BB:D0','ZOB-AP07','cm9gzffbz001jitiyjuwqe009','2025-04-14 11:33:31.993000','2025-04-14 11:34:39.270000'),('cm9gzx5tw0021itiycpc7vvzn','BC:E6:7C:52:2D:E0','ZOB-AP06','cm9gzffbz001jitiyjuwqe009','2025-04-14 11:34:03.717000','2025-04-14 11:34:03.717000'),('cm9gzxrs20023itiyjt1eqcyc','BC:A9:93:63:A3:92','ZOB-AP08','cm9gzffbz001jitiyjuwqe009','2025-04-14 11:34:32.162000','2025-04-14 11:34:32.162000'),('cm9ijy6wo000f2p6w5s6uv2wm','BC-A9-93-5F-C4-9C','AP01 Gemeindehaus','cm9ijubu300072p6wio9ufrdl','2025-04-15 13:42:30.264000','2025-04-15 13:42:30.264000'),('cm9ikcq92000h2p6wrtcy0yrx','F0-3E-90-04-DA-A8','Gerät 1','cm9iju70g00052p6w6zow88wh','2025-04-15 13:53:48.518000','2025-04-15 13:53:48.518000'),('cm9ikd51g000j2p6wfu95wjps','F0-3E-90-04-DA-AC','Gerät 2','cm9iju70g00052p6w6zow88wh','2025-04-15 13:54:07.684000','2025-04-15 13:54:07.684000'),('cm9ikdhwe000l2p6w7uwvt9yu','F0-3E-90-21-5E-9C','Gerät 3','cm9iju70g00052p6w6zow88wh','2025-04-15 13:54:24.350000','2025-04-15 13:54:24.350000'),('cm9ikg18m000n2p6wwfa5k7ok','1C-B9-C4-04-60-38','Gerät 4','cm9iju70g00052p6w6zow88wh','2025-04-15 13:56:22.726000','2025-04-15 13:56:22.726000'),('cm9ikg84s000p2p6wwudwxvra','F0-3E-90-21-5E-98','Gerät 5','cm9iju70g00052p6w6zow88wh','2025-04-15 13:56:31.661000','2025-04-15 13:56:31.661000'),('cm9ikgh20000r2p6whtbpj7ij','E8-1D-A8-23-B4-18','Gerät 6','cm9iju70g00052p6w6zow88wh','2025-04-15 13:56:43.224000','2025-04-15 13:56:43.224000'),('cm9ikgqc2000t2p6w9u8t32vu','F0-3E-90-04-CD-8C','Gerät 7','cm9iju70g00052p6w6zow88wh','2025-04-15 13:56:55.250000','2025-04-15 13:56:55.250000'),('cm9ikgyfo000v2p6w0rt8p94z','F0-3E-90-04-CD-88','Gerät 8','cm9iju70g00052p6w6zow88wh','2025-04-15 13:57:05.748000','2025-04-15 13:57:05.748000'),('cm9ikh9zp000x2p6wg46aef2s','1C-B9-C4-04-60-3C','Gerät 9','cm9iju70g00052p6w6zow88wh','2025-04-15 13:57:20.725000','2025-04-15 13:57:20.725000'),('cm9ikhhqe000z2p6whyscde5p','E8-1D-A8-23-C9-18','Gerät 10','cm9iju70g00052p6w6zow88wh','2025-04-15 13:57:30.758000','2025-04-15 13:57:30.758000'),('cm9ikhrel00112p6wohap1x0h','E8-1D-A8-23-C9-1C','Gerät 11','cm9iju70g00052p6w6zow88wh','2025-04-15 13:57:43.293000','2025-04-15 13:57:43.293000'),('cm9ikhz5a00132p6wtgix3a9t','E8-1D-A8-23-B4-1C','Gerät 12','cm9iju70g00052p6w6zow88wh','2025-04-15 13:57:53.326000','2025-04-15 13:57:53.326000'),('cm9wj03um0009l6v0p8nv43cf','FC:11:65:BA:55:20','Butzbach Bürgerhaus Foyer','cm9wixla10003l6v0soprujip','2025-04-25 08:24:46.453000','2025-04-25 08:24:46.453000'),('cm9wj1kyo000bl6v0cp6pm9v5','FC:11:65:BA:4E:00','Butzbach Bürgerhaus Großer Saal','cm9wiyh270005l6v056lyw6d6','2025-04-25 08:25:55.297000','2025-04-25 08:25:55.297000'),('cm9wj2txe000dl6v0annirxq2','FC:11:65:BA:3A:FE','Butzbach Bürgerhaus Gruppenraum','cm9wiyrp60007l6v0h4ufsxsk','2025-04-25 08:26:53.562000','2025-04-25 08:26:53.562000'),('cm9x4m2ei000ll6v0ws3c1p0u','FC:11:65:BA:55:7A','Bürgerhaus Griedel Mehrzweckraum','cm9x4j2w5000jl6v0u6nbhjn1','2025-04-25 18:29:42.692000','2025-04-25 18:29:42.692000'),('cm9x4mswn000nl6v0imil1dqh','FC:11:65:BA:4C:1C','Bürgerhaus Griedel Saal','cm9x4iuzx000hl6v0ttfz1s9h','2025-04-25 18:30:17.303000','2025-04-25 18:30:17.303000'),('cm9x7hdll0011l6v081b0yaio','BC:E6:7C:39:A3:68','Nidda06','cm9x7akzg000tl6v0sw9aqu3i','2025-04-25 19:50:03.034000','2025-04-25 19:50:14.398000'),('cm9x7o5ue001bl6v09jh5p0in','58:C1:7A:8F:11:F2','Nidda08','cm9x7f1ni000xl6v03orxo3o9','2025-04-25 19:55:19.565000','2025-04-25 19:55:19.565000'),('cm9x7phzg001fl6v0b1k866k1','BC:E6:7C:32:98:0C','Großer Clubraum','cm9x7ko590017l6v0is9zl5ym','2025-04-25 19:56:21.955000','2025-04-25 19:56:21.955000'),('cm9x7q0iy001hl6v07ynqrf0w','BC:E6:7C:43:DA:D6','Nidda20','cm9x7kzpx0019l6v0trftzeix','2025-04-25 19:56:45.986000','2025-04-25 19:56:45.986000'),('cm9x7qjb9001jl6v0wzwtn6rl','BC:E6:7C:39:80:FC','Nidda07','cm9x7izpm0013l6v0omx1n96h','2025-04-25 19:57:10.332000','2025-04-25 19:57:10.332000'),('cm9x7rh3b001ll6v0hjgpilfv','58:C1:7A:8C:96:02','Nidda17','cm9x7kboj0015l6v09lfvd4y3','2025-04-25 19:57:54.110000','2025-04-25 19:57:54.110000'),('cm9x7wteb001rl6v0m0zh778r','BC:E6:7C:31:A9:68','Nidda09','cm9x7uzmb001pl6v0is3fejo1','2025-04-25 20:02:03.347000','2025-04-25 20:02:03.347000'),('cm9x7xaki001tl6v0qt218qk3','BC:E6:7C:31:A9:EC','Nidda10','cm9x7uzmb001pl6v0is3fejo1','2025-04-25 20:02:25.592000','2025-04-25 20:02:25.592000'),('cm9xtlfif001zl6v0m1y4z77b','BC:E6:7C:39:80:4C','Nidda11','cm9x8219u001xl6v01jhxmluj','2025-04-26 06:09:03.673000','2025-04-26 06:09:03.673000'),('cm9xttb9e002rl6v06foy5c44','58:C1:7A:8F:15:FA','Nidda05','cm9xtrggs002ll6v0t6h43rw3','2025-04-26 06:15:11.419000','2025-04-26 06:15:11.419000'),('cm9xtwx7g002tl6v0drlc8ckr','58:C1:7A:8F:15:FA','Nidda02','cm9xtnlsp0027l6v0ems6zf2s','2025-04-26 06:17:59.836000','2025-04-26 06:17:59.836000'),('cm9xu2vt6002vl6v0jdaqbyx1','BC:E6:7C:31:21:BA','Nidda01','cm9xtmsp20023l6v06nk3ak88','2025-04-26 06:22:37.954000','2025-04-26 06:22:37.954000'),('cm9xu3oki002xl6v099vau3rn','BC:E6:7C:35:7E:8C','Rathaus','cm9xtopt6002bl6v0394ey1hv','2025-04-26 06:23:15.226000','2025-04-26 06:23:15.226000'),('cm9xu4g55002zl6v0oc0oifqo','58:C1:7A:8E:E7:8C','Nidda15','cm9xtsc55002pl6v04dwh6bkx','2025-04-26 06:23:50.969000','2025-04-26 06:23:50.969000'),('cm9xu57200031l6v0fna0zmf9','58:C1:7A:8F:15:FA','Nidda16','cm9xtqk2u002fl6v0l262iedp','2025-04-26 06:24:25.849000','2025-04-26 06:24:25.849000'),('cmaf02r780005p7v064mqsosk','BC:A9:93:5F:AC:78','Erich-Kästner Schule','cmaf01nf00003p7v02ytqxjyj','2025-05-08 06:42:34.667000','2025-05-08 06:42:34.667000'),('cmafioyvk000bp7v0k3ljrz1i','BC:A9:93:5F:AE:D9','AP03','cmafiok9d0009p7v0uzmj1wx4','2025-05-08 15:23:44.144000','2025-05-08 15:23:44.144000'),('cmafizfgo000hp7v0ardhmomp','BC:A9:93:5F:AE:D9','AP04','cmafiv8fc000fp7v012z6houp','2025-05-08 15:31:52.201000','2025-05-08 15:31:52.201000'),('cmafj5r75000np7v0ieu7pwlw','BC:A9:93:5F:B1:63','AP05','cmafj58i8000lp7v0fqvve2ws','2025-05-08 15:36:47.345000','2025-05-08 15:36:47.345000'),('cmafjc18t000tp7v0s7acn4fk','BC:A9:93:5F:AC:3E','AP06','cmafjb4jj000rp7v06d7lt68o','2025-05-08 15:41:40.006000','2025-05-08 15:41:40.006000'),('cmafjo71d000zp7v0oux3wqft','58:C1:7A:16:77:10','AP10 Ampel','cmafjnqx7000xp7v03aceliw1','2025-05-08 15:51:07.672000','2025-05-08 15:51:07.672000'),('cmafjutl50015p7v0uqh8cf6b','BC:A9:93:5F:AC:33','AP09 Bahnhofstrasse','cmafjtwdh0013p7v0zk37wj9v','2025-05-08 15:56:16.842000','2025-05-08 15:56:16.842000');
/*!40000 ALTER TABLE `Device` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TreeNode`
--

DROP TABLE IF EXISTS `TreeNode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TreeNode` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `TreeNode_parentId_idx` (`parentId`),
  CONSTRAINT `TreeNode_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `TreeNode` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TreeNode`
--

LOCK TABLES `TreeNode` WRITE;
/*!40000 ALTER TABLE `TreeNode` DISABLE KEYS */;
INSERT INTO `TreeNode` VALUES ('cm9flehli0003itl8m911dt7d','Chilinet',NULL,'ROOT','2025-04-13 11:59:51.703000','2025-04-13 12:30:40.095000'),('cm9fmhfkz0005itmzoj0r4yhy','Bad Orb','cm9flehli0003itl8m911dt7d','KUNDE','2025-04-13 12:30:08.676000','2025-04-13 13:29:24.477000'),('cm9fmoirm000fitmzgz9lrdgc','Stadt Butzbach','cm9flehli0003itl8m911dt7d','KUNDE','2025-04-13 12:35:39.394000','2025-04-14 11:10:38.615000'),('cm9fmy4g1000litmzyrjb768m','Freibad','cm9fmhfkz0005itmzoj0r4yhy','STANDORT','2025-04-13 12:43:07.393000','2025-04-13 13:29:34.479000'),('cm9fmyebu000nitmz3n166yun','Freibad Kasse','cm9fmy4g1000litmzyrjb768m','BEREICH','2025-04-13 12:43:20.202000','2025-04-19 17:55:45.779000'),('cm9fn26li000pitmzu5frz0ay','Stadt Maintal','cm9flehli0003itl8m911dt7d','KUNDE','2025-04-13 12:46:16.806000','2025-04-13 21:19:26.789000'),('cm9fom5pb0005it39sja8vw3z','Wohnmobilstellplatz','cm9fmhfkz0005itmzoj0r4yhy','STANDORT','2025-04-13 13:29:48.384000','2025-04-13 13:38:19.319000'),('cm9foms510007it39br16zb5k','Freibad Wiese','cm9fmy4g1000litmzyrjb768m','BEREICH','2025-04-13 13:30:17.462000','2025-04-19 17:56:25.981000'),('cm9g302uv0001itiy08wmx63j','Stellplatz','cm9fom5pb0005it39sja8vw3z','BEREICH','2025-04-13 20:12:32.502000','2025-04-13 20:12:54.446000'),('cm9g5elxk0007itiyfj11383z','Rathaus ','cm9fn26li000pitmzu5frz0ay','STANDORT','2025-04-13 21:19:49.640000','2025-04-14 05:56:13.315000'),('cm9g5etnm0009itiy6u5t2gx5','AP07','cm9g5elxk0007itiyfj11383z','BEREICH','2025-04-13 21:19:59.650000','2025-04-13 21:19:59.650000'),('cm9gnujvc000ditiyxfr61sr7','Bürgerhaus Wachenbuchen','cm9fn26li000pitmzu5frz0ay','STANDORT','2025-04-14 05:56:06.552000','2025-04-14 05:56:06.552000'),('cm9gnuwxc000fitiywdivha1p','AP01','cm9gnujvc000ditiyxfr61sr7','BEREICH','2025-04-14 05:56:23.473000','2025-04-14 05:56:23.473000'),('cm9gxpkue000nitiyod0pc9x6','Maintal Halle','cm9fn26li000pitmzu5frz0ay','STANDORT','2025-04-14 10:32:10.695000','2025-04-14 10:32:15.666000'),('cm9gxq2jw000pitiyk2x4ng6i','AP02','cm9gxpkue000nitiyod0pc9x6','BEREICH','2025-04-14 10:32:33.644000','2025-04-14 10:32:51.130000'),('cm9gz3bdc000titiyp0kgasz2','Rathaus','cm9fmoirm000fitmzgz9lrdgc','STANDORT','2025-04-14 11:10:51.217000','2025-04-14 11:10:51.217000'),('cm9gz3ner000vitiy2pgxk4zt','Marktplatz','cm9gz3bdc000titiyp0kgasz2','BEREICH','2025-04-14 11:11:06.819000','2025-04-14 11:11:06.819000'),('cm9gz7isv000zitiyh3y75jsd','Stadt Siegen','cm9flehli0003itl8m911dt7d','KUNDE','2025-04-14 11:14:07.472000','2025-04-14 11:14:07.472000'),('cm9gz7wl20011itiyv3nwbvn9','Freibäder','cm9gz7isv000zitiyh3y75jsd','STANDORT','2025-04-14 11:14:25.334000','2025-04-14 11:14:30.958000'),('cm9gz8ot30015itiyl3m4o5jp','Freibad 1','cm9gz7wl20011itiyv3nwbvn9','BEREICH','2025-04-14 11:15:01.911000','2025-04-14 11:15:01.911000'),('cm9gz8tsc0017itiyxq5tu7fl','Freibad 2','cm9gz7wl20011itiyv3nwbvn9','BEREICH','2025-04-14 11:15:08.364000','2025-04-14 11:15:08.364000'),('cm9gz964o0019itiyz2zmnokh','ZOB Busbahnhof','cm9gz7isv000zitiyh3y75jsd','STANDORT','2025-04-14 11:15:24.361000','2025-04-14 11:15:57.396000'),('cm9gz9qjy001bitiypn2ate3i','Herrengarten','cm9gz7isv000zitiyh3y75jsd','STANDORT','2025-04-14 11:15:50.831000','2025-04-14 11:15:53.949000'),('cm9gzarc4001ditiynt5bhdv4','Apollo Theater','cm9gz7isv000zitiyh3y75jsd','STANDORT','2025-04-14 11:16:38.501000','2025-04-14 11:16:38.501000'),('cm9gzevpt001fitiyr6ctzxft','Dach','cm9gzarc4001ditiynt5bhdv4','BEREICH','2025-04-14 11:19:50.801000','2025-04-14 11:19:50.801000'),('cm9gzf6rs001hitiyg1whmkcf','Herrengarten','cm9gz9qjy001bitiypn2ate3i','BEREICH','2025-04-14 11:20:05.129000','2025-04-14 11:20:09.643000'),('cm9gzffbz001jitiyjuwqe009','Wartebereich','cm9gz964o0019itiyz2zmnokh','BEREICH','2025-04-14 11:20:16.223000','2025-04-14 11:33:11.212000'),('cm9ijtpik00012p6w45mdcjf9','JZ-Tempel','cm9flehli0003itl8m911dt7d','KUNDE','2025-04-15 13:39:01.099000','2025-04-15 13:39:01.099000'),('cm9iju70g00052p6w6zow88wh','Tempel','cm9ijtpik00012p6w45mdcjf9','BEREICH','2025-04-15 13:39:23.777000','2025-04-15 13:41:59.935000'),('cm9ijubu300072p6wio9ufrdl','Gemeindehaus','cm9ijtpik00012p6w45mdcjf9','BEREICH','2025-04-15 13:39:30.028000','2025-04-15 13:41:52.488000'),('cm9ijw2yd000b2p6wwts2677b','Aussen','cm9ijtpik00012p6w45mdcjf9','BEREICH','2025-04-15 13:40:51.829000','2025-04-15 13:40:58.815000'),('cm9wix2l70001l6v0ksui3fuy','Buergerhaus Butzbach','cm9fmoirm000fitmzgz9lrdgc','STANDORT','2025-04-25 08:22:24.859000','2025-04-25 08:22:24.859000'),('cm9wixla10003l6v0soprujip','Foyer','cm9wix2l70001l6v0ksui3fuy','BEREICH','2025-04-25 08:22:49.082000','2025-04-25 08:22:55.894000'),('cm9wiyh270005l6v056lyw6d6','Großer Saal','cm9wix2l70001l6v0ksui3fuy','BEREICH','2025-04-25 08:23:30.271000','2025-04-25 08:23:30.271000'),('cm9wiyrp60007l6v0h4ufsxsk','Gruppenraum','cm9wix2l70001l6v0ksui3fuy','BEREICH','2025-04-25 08:23:44.059000','2025-04-25 08:23:44.059000'),('cm9x4ijk0000fl6v00kmyvclj','Buergerhaus Griedel','cm9fmoirm000fitmzgz9lrdgc','STANDORT','2025-04-25 18:26:58.556000','2025-04-25 18:26:58.556000'),('cm9x4iuzx000hl6v0ttfz1s9h','Saal','cm9x4ijk0000fl6v00kmyvclj','BEREICH','2025-04-25 18:27:13.389000','2025-04-25 18:28:43.549000'),('cm9x4j2w5000jl6v0u6nbhjn1','Mehrzweckraum','cm9x4ijk0000fl6v00kmyvclj','BEREICH','2025-04-25 18:27:23.621000','2025-04-25 18:28:27.453000'),('cm9x7a05k000pl6v0p0rqxvtn','Stadt Nidda','cm9flehli0003itl8m911dt7d','KUNDE','2025-04-25 19:44:19.016000','2025-04-25 19:44:19.016000'),('cm9x7adqz000rl6v0da13w9lz','Bürgerhaus','cm9x7a05k000pl6v0p0rqxvtn','STANDORT','2025-04-25 19:44:36.635000','2025-04-25 19:44:36.635000'),('cm9x7akzg000tl6v0sw9aqu3i','Großer Saal','cm9x7adqz000rl6v0da13w9lz','BEREICH','2025-04-25 19:44:46.013000','2025-04-25 19:47:42.403000'),('cm9x7f1ni000xl6v03orxo3o9','Aussen Parkplatz','cm9x7adqz000rl6v0da13w9lz','BEREICH','2025-04-25 19:48:14.238000','2025-04-25 19:51:40.921000'),('cm9x7izpm0013l6v0omx1n96h','Kleiner Saal','cm9x7adqz000rl6v0da13w9lz','BEREICH','2025-04-25 19:51:18.346000','2025-04-25 19:51:18.346000'),('cm9x7kboj0015l6v09lfvd4y3','Nidda Festplatz','cm9x7adqz000rl6v0da13w9lz','BEREICH','2025-04-25 19:52:20.515000','2025-04-25 19:52:20.515000'),('cm9x7ko590017l6v0is9zl5ym','Großer Clubraum','cm9x7adqz000rl6v0da13w9lz','BEREICH','2025-04-25 19:52:36.669000','2025-04-25 19:52:36.669000'),('cm9x7kzpx0019l6v0trftzeix','Kleiner Clubraum','cm9x7adqz000rl6v0da13w9lz','BEREICH','2025-04-25 19:52:51.662000','2025-04-25 19:52:51.662000'),('cm9x7ub99001nl6v05pdjx0g9','Freibad','cm9x7a05k000pl6v0p0rqxvtn','STANDORT','2025-04-25 20:00:06.525000','2025-04-25 20:00:17.477000'),('cm9x7uzmb001pl6v0is3fejo1','Kassenhaus','cm9x7ub99001nl6v05pdjx0g9','BEREICH','2025-04-25 20:00:38.100000','2025-04-25 20:01:14.951000'),('cm9x80f61001vl6v0bgq5islv','GeisNidda','cm9x7a05k000pl6v0p0rqxvtn','STANDORT','2025-04-25 20:04:51.530000','2025-04-25 20:05:41.232000'),('cm9x8219u001xl6v01jhxmluj','Saal','cm9x80f61001vl6v0bgq5islv','BEREICH','2025-04-25 20:06:06.834000','2025-04-25 20:06:06.834000'),('cm9xtm6oq0021l6v0w7ii4whp','Marktplatz','cm9x7a05k000pl6v0p0rqxvtn','STANDORT','2025-04-26 06:09:38.906000','2025-04-26 06:09:38.906000'),('cm9xtmsp20023l6v06nk3ak88','Marktplatz','cm9xtm6oq0021l6v0w7ii4whp','BEREICH','2025-04-26 06:10:07.430000','2025-04-26 06:10:07.430000'),('cm9xtn7ng0025l6v0yo7mu23a','Heimatmuseum','cm9x7a05k000pl6v0p0rqxvtn','STANDORT','2025-04-26 06:10:26.812000','2025-04-26 06:10:26.812000'),('cm9xtnlsp0027l6v0ems6zf2s','Heimatmuseum','cm9xtn7ng0025l6v0yo7mu23a','BEREICH','2025-04-26 06:10:45.145000','2025-04-26 06:10:55.457000'),('cm9xtoi4r0029l6v0pw5r6zpp','Rathaus','cm9x7a05k000pl6v0p0rqxvtn','STANDORT','2025-04-26 06:11:27.052000','2025-04-26 06:11:27.052000'),('cm9xtopt6002bl6v0394ey1hv','Wartezone','cm9xtoi4r0029l6v0pw5r6zpp','BEREICH','2025-04-26 06:11:37.003000','2025-04-26 06:11:42.970000'),('cm9xtq9fv002dl6v040k7p1xy','Mobile Lösung','cm9x7a05k000pl6v0p0rqxvtn','STANDORT','2025-04-26 06:12:49.100000','2025-04-26 06:12:49.100000'),('cm9xtqk2u002fl6v0l262iedp','Koffer 1','cm9xtq9fv002dl6v040k7p1xy','BEREICH','2025-04-26 06:13:02.887000','2025-04-26 06:13:02.887000'),('cm9xtqrbw002hl6v0kr7vctof','Koffer 2','cm9xtq9fv002dl6v040k7p1xy','BEREICH','2025-04-26 06:13:12.285000','2025-04-26 06:13:12.285000'),('cm9xtr66x002jl6v0rciyzt30','Bibliothek','cm9x7a05k000pl6v0p0rqxvtn','STANDORT','2025-04-26 06:13:31.546000','2025-04-26 06:13:31.546000'),('cm9xtrggs002ll6v0t6h43rw3','Bibliothekt','cm9xtr66x002jl6v0rciyzt30','BEREICH','2025-04-26 06:13:44.860000','2025-04-26 06:13:44.860000'),('cm9xts52j002nl6v03r3osp8j','Trinkkurhalle','cm9x7a05k000pl6v0p0rqxvtn','STANDORT','2025-04-26 06:14:16.747000','2025-04-26 06:14:16.747000'),('cm9xtsc55002pl6v04dwh6bkx','Turm','cm9xts52j002nl6v03r3osp8j','BEREICH','2025-04-26 06:14:25.914000','2025-04-26 06:14:25.914000'),('cmaf01a9u0001p7v05p5xluq8','Erich-Kästner Schule','cm9fn26li000pitmzu5frz0ay','STANDORT','2025-05-08 06:41:26.082000','2025-05-08 06:41:26.082000'),('cmaf01nf00003p7v02ytqxjyj','AP08','cmaf01a9u0001p7v05p5xluq8','BEREICH','2025-05-08 06:41:43.116000','2025-05-08 06:41:43.116000'),('cmafimxo40007p7v0y3z8u8b0','Leinpfad','cm9fn26li000pitmzu5frz0ay','STANDORT','2025-05-08 15:22:09.256000','2025-05-08 15:22:36.772000'),('cmafiok9d0009p7v0uzmj1wx4','AP03','cmafimxo40007p7v0y3z8u8b0','BEREICH','2025-05-08 15:23:25.202000','2025-05-08 15:23:25.202000'),('cmafiuwnm000dp7v00myzr7z4','Werner von Siemens Schule','cm9fn26li000pitmzu5frz0ay','STANDORT','2025-05-08 15:28:21.203000','2025-05-08 15:28:21.203000'),('cmafiv8fc000fp7v012z6houp','AP04','cmafiuwnm000dp7v00myzr7z4','BEREICH','2025-05-08 15:28:36.457000','2025-05-08 15:28:36.457000'),('cmafj50cu000jp7v0paamlz6c','Klingstrasse ','cm9fn26li000pitmzu5frz0ay','STANDORT','2025-05-08 15:36:12.558000','2025-05-08 15:36:12.558000'),('cmafj58i8000lp7v0fqvve2ws','AP05','cmafj50cu000jp7v0paamlz6c','BEREICH','2025-05-08 15:36:23.120000','2025-05-08 15:36:23.120000'),('cmafjaxme000pp7v04p95r8f2','Familienzentrum Schillerstrasse','cm9fn26li000pitmzu5frz0ay','STANDORT','2025-05-08 15:40:48.951000','2025-05-08 15:40:48.951000'),('cmafjb4jj000rp7v06d7lt68o','AP06','cmafjaxme000pp7v04p95r8f2','BEREICH','2025-05-08 15:40:57.919000','2025-05-08 15:40:57.919000'),('cmafjndci000vp7v0c83u2hxl','Kennedystrasse','cm9fn26li000pitmzu5frz0ay','STANDORT','2025-05-08 15:50:29.202000','2025-05-08 15:50:29.202000'),('cmafjnqx7000xp7v03aceliw1','AP10 Ampel','cmafjndci000vp7v0c83u2hxl','BEREICH','2025-05-08 15:50:46.795000','2025-05-08 15:50:46.795000'),('cmafjtfcj0011p7v02rguhmpq','Busbahnhof','cm9fn26li000pitmzu5frz0ay','STANDORT','2025-05-08 15:55:11.731000','2025-05-08 15:55:11.731000'),('cmafjtwdh0013p7v0zk37wj9v','AP09 Bahnhofstrasse ','cmafjtfcj0011p7v02rguhmpq','BEREICH','2025-05-08 15:55:33.797000','2025-05-08 15:55:33.797000');
/*!40000 ALTER TABLE `TreeNode` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emailVerified` datetime(6) DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nodeId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL,
  `resetToken` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resetTokenExpiry` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_nodeId_idx` (`nodeId`),
  CONSTRAINT `User_nodeId_fkey` FOREIGN KEY (`nodeId`) REFERENCES `TreeNode` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-08 19:18:02.000000','2025-09-08 19:18:02.000000',NULL,NULL),('cm9ixrbkt00002pdn4ofo8os5','Test User','test@example.com',NULL,'NULL','$2b$12$ZZDkWcl39xdAp0DfCv9jy.JaoOxuuoDdu0xZO3G5.E3xACibWf9hu','ADMIN','cm9fmhfkz0005itmzoj0r4yhy','2025-04-15 20:09:04.350000','2025-04-15 21:07:47.759000','NULL',NULL),('cm9iywyoj00002p4mam9xyus7','sfsfsfd','stefan@heatmanager.de',NULL,'NULL','$2b$12$ocAg2h98hAobDOrJCYo0cuNfD0R9EKygkaIHYFcV4twCFbQyFCv7a','ADMIN','cm9fmoirm000fitmzgz9lrdgc','2025-04-15 20:41:27.187000','2025-04-16 16:22:58.142000','NULL',NULL),('cm9iz2xtd00012p4mj0su726i','stefanluther2','sluther@chilinet.solutions',NULL,'NULL','$2b$12$krubZ81q4Rsppq3f6gPnUuTtNQusj90IPCdPpZCCqqPyU0Ova3/2.','SUPERADMIN','NULL','2025-04-15 20:46:06.001000','2025-09-08 17:08:29.648000','NULL',NULL),('cm9izhmgy00052p4mi6y7ehk7','ddfffdd','test@heatmanager.de',NULL,'NULL','$2b$12$V7cVa4SkvVF6JoJ3hfTflOMr1YdOstw6fNuUQ5tbSmPD/G5QFDnhy','SUPERADMIN','cm9fmoirm000fitmzgz9lrdgc','2025-04-15 20:57:31.138000','2025-04-17 10:36:34.696000','NULL',NULL),('cm9l7aiqa0000itlqxdgxig5u','Testuser','test123@asss.de',NULL,'NULL','$2b$12$4JShlLv9/mKwEfkf/CjkyetpUTfr/3ElxTXc4FEG7yN8aLpz8MNBq','USER','NULL','2025-04-17 10:11:28.978000','2025-04-17 10:11:28.978000','NULL',NULL),('cm9l7i3vq0001itlq03qp5mah','test123456','test123456@chilinet.de',NULL,'NULL','$2b$12$Cb6K0mhielcQYa6H5clYo.spxZoZ6BtSkfr0YEV6OH8wgT7P8Nsu.','USER','NULL','2025-04-17 10:17:22.983000','2025-04-17 10:17:22.983000','NULL',NULL),('cm9l7l4pc0003itlq399lk6qb','test567890','test567890@chilinet.de',NULL,'NULL','$2b$12$M4majYDO64S8ZFDPZlTGmezpiu1zTbzHMRXzxkjguDLS6/pY7FuMG','ADMIN','cm9gz7isv000zitiyh3y75jsd','2025-04-17 10:19:44.016000','2025-04-17 10:20:14.308000','NULL',NULL),('cm9l9imcw0001it7bfz2e2sz4','Testbenutezr','fsdfsdf@fhsdgsd.de',NULL,'NULL','$2b$12$hEDFOb/4aAnPLeZv3f/eFeExBrGz0c.QbC0JU9E3ub5hw279FdV9i','USER','cm9gz7isv000zitiyh3y75jsd','2025-04-17 11:13:46.161000','2025-04-17 11:13:46.161000','NULL',NULL),('cm9oja4000001mhvbrfmtww10','Testman','sluther@myluther.de',NULL,'NULL','$2b$12$p50Trdx5fvI3PhTf7Tgc5OVkCUCMTcAo2vD/UoQK2CJbOGl7T5OxO','USER','cm9fmoirm000fitmzgz9lrdgc','2025-04-19 18:10:23.799000','2025-04-19 18:10:23.799000','NULL',NULL),('cma13y0xl0033l6v0jf5s5krs','Timo Köller','timo.koeller@stadt-butzbach.de',NULL,'NULL','$2b$12$I3zGG54HvQYC8yLJXt5geu2hpf8l4qiSuUEJHSde/uakKUmPMGrRa','ADMIN','cm9fmoirm000fitmzgz9lrdgc','2025-04-28 13:22:06.001000','2025-05-13 06:24:19.877000','NULL',NULL),('cmafjzf760017p7v077kq1lg0','Jürgen Vogel','j.vogel@maintal.de',NULL,'NULL','$2b$12$dnB5IlUfS/oFMrQK0D35Nesz8C.SXbATncSP7CSx.qKt4fNO94NgW','ADMIN','cm9fn26li000pitmzu5frz0ay','2025-05-08 15:59:51.475000','2025-05-08 16:10:17.280000','NULL',NULL);
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

-- Dump completed on 2025-09-09 17:04:45
