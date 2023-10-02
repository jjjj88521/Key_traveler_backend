-- MySQL dump 10.13  Distrib 8.0.33, for macos13.3 (arm64)
--
-- Host: 127.0.0.1    Database: test
-- ------------------------------------------------------
-- Server version	8.0.33

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
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `pid` int DEFAULT NULL,
  `uid` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=118 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (1,25,1),(3,27,1),(7,30,1),(25,20,1),(34,1,2),(60,9,1),(61,11,1),(103,7,1),(106,1,1),(114,5,1),(115,4,1),(116,13,1),(117,12,1);
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) DEFAULT NULL,
  `price` int DEFAULT NULL,
  `img` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Refined Bronze Bike背心',9100,'https://picsum.photos/seed/QCJQM/640/480'),(2,'Intelligent Fresh Chicken短褲',6500,'https://picsum.photos/seed/ltDUjk/640/480'),(3,'Handcrafted Concrete Bike短褲',8900,'https://loremflickr.com/640/480?lock=5706018413608960'),(4,'Handcrafted Rubber Pants短袖上衣',3200,'https://loremflickr.com/640/480?lock=187031867097088'),(5,'Oriental Metal Pants長袖上衣',6300,'https://picsum.photos/seed/HyttvWHk/640/480'),(6,'Generic Rubber Gloves背心',4400,'https://loremflickr.com/640/480?lock=3311164509388800'),(7,'Gorgeous Frozen Hat長褲',7000,'https://loremflickr.com/640/480?lock=5770535313080320'),(8,'Ergonomic Granite Bike短袖上衣',5400,'https://loremflickr.com/640/480?lock=5659323585789952'),(9,'Rustic Plastic Table運動鞋',5500,'https://picsum.photos/seed/xUG6o/640/480'),(10,'Modern Rubber Sausages短褲',1500,'https://picsum.photos/seed/Q6IcuX/640/480'),(11,'Fantastic Cotton Chair短袖上衣',8600,'https://picsum.photos/seed/GUpgjo/640/480'),(12,'Intelligent Steel Keyboard長袖上衣',7100,'https://picsum.photos/seed/sRmSz/640/480'),(13,'Handcrafted Frozen Pants短袖上衣',3600,'https://picsum.photos/seed/H85hnR9/640/480'),(14,'Awesome Rubber Shoes短袖上衣',8800,'https://picsum.photos/seed/ARAxWBO/640/480'),(15,'Sleek Frozen Soap長褲',9600,'https://picsum.photos/seed/rxQfS/640/480'),(16,'Modern Plastic Pizza背心',4400,'https://picsum.photos/seed/CbZnmC4P4/640/480'),(17,'Handcrafted Granite Shirt背心',2100,'https://loremflickr.com/640/480?lock=2380480135561216'),(18,'Licensed Fresh Fish短袖上衣',1800,'https://loremflickr.com/640/480?lock=5448452584505344'),(19,'Elegant Steel Keyboard短褲',6400,'https://loremflickr.com/640/480?lock=5760995412672512'),(20,'Generic Metal Cheese長袖上衣',2200,'https://picsum.photos/seed/hU3uKR/640/480'),(21,'Handcrafted Rubber Chips長褲',2500,'https://loremflickr.com/640/480?lock=5402998123528192'),(22,'Awesome Soft Bacon長褲',6300,'https://picsum.photos/seed/QodG4/640/480'),(23,'Intelligent Plastic Towels背心',9300,'https://loremflickr.com/640/480?lock=1257547302436864'),(24,'Incredible Metal Shoes短袖上衣',9100,'https://loremflickr.com/640/480?lock=8023047348944896'),(25,'Sleek Soft Chicken短袖上衣',8300,'https://loremflickr.com/640/480?lock=8253664237977600'),(26,'Luxurious Granite Chair短褲',5800,'https://loremflickr.com/640/480?lock=1511001040093184'),(27,'Incredible Metal Salad短袖上衣',2600,'https://loremflickr.com/640/480?lock=7788330188013568'),(28,'Elegant Bronze Table短袖上衣',6800,'https://loremflickr.com/640/480?lock=3736130144960512'),(29,'Bespoke Metal Hat長袖上衣',1600,'https://picsum.photos/seed/Prqxet1G0/640/480'),(30,'Rustic Bronze Shirt短褲',8200,'https://loremflickr.com/640/480?lock=2689347830677504');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `username` varchar(200) DEFAULT NULL,
  `password` varchar(200) DEFAULT NULL,
  `r_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `google_uid` varchar(200) DEFAULT NULL,
  `photo_url` varchar(200) DEFAULT NULL,
  `line_uid` varchar(200) DEFAULT NULL,
  `line_access_token` text,
  `fb_uid` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'金妮','ginny@test.com','ginny132','12345','2023-01-01 00:00:00',NULL,NULL,NULL,NULL,NULL),(2,'哈利','herry@test.com','herry','22222','2023-06-03 00:00:00',NULL,NULL,NULL,NULL,NULL),(3,'妙麗','mione@test.com','mione','33333','2023-06-06 00:00:00',NULL,NULL,NULL,NULL,NULL),(4,'12','1231231231','123123','3123','2023-07-12 16:11:14',NULL,NULL,NULL,NULL,NULL),(5,'Eddy','hello@eddychang.me','eddy123','123123','2023-07-12 16:26:12',NULL,NULL,NULL,NULL,NULL),(6,'金妮4444','ginny@test.com','ginny13','12345','2023-07-25 15:40:15',NULL,NULL,NULL,NULL,NULL),(7,'xx','xxf@test.com','giny','123','2023-08-04 16:29:54',NULL,NULL,NULL,NULL,NULL),(15,'陳查斯','service@joomla.com.tw',NULL,NULL,'2023-08-12 17:14:44',NULL,'https://graph.facebook.com/5848997788471251/picture',NULL,NULL,'5848997788471251');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-08-20 22:33:13
