-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: uteshop
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (1,'AORUS','https://example.com/logos/aorus.png','2026-05-13 16:02:37','2026-05-13 16:02:37'),(2,'ASUS','https://example.com/logos/asus.png','2026-05-13 16:02:37','2026-05-13 16:02:37'),(3,'DELL','https://example.com/logos/dell.png','2026-05-13 16:02:37','2026-05-13 16:02:37'),(5,'LENOVO','https://example.com/logos/lenovo.png','2026-05-13 16:02:37','2026-05-13 16:02:37'),(6,'MSI','https://example.com/logos/msi.png','2026-05-13 16:02:37','2026-05-13 16:02:37'),(7,'APPLE','https://example.com/logos/apple.png','2026-05-13 16:02:37','2026-05-13 16:02:37');
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cartitems`
--

DROP TABLE IF EXISTS `cartitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartitems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cartId` int NOT NULL,
  `productId` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(12,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cartId` (`cartId`),
  KEY `productId` (`productId`),
  CONSTRAINT `cartitems_ibfk_1` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`),
  CONSTRAINT `cartitems_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  CONSTRAINT `cartitems_ibfk_3` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cartitems_ibfk_4` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cartitems`
--

LOCK TABLES `cartitems` WRITE;
/*!40000 ALTER TABLE `cartitems` DISABLE KEYS */;
/*!40000 ALTER TABLE `cartitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId` (`userId`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (3,8,'2026-06-27 08:32:12','2026-06-27 08:32:12'),(5,30,'2026-07-01 18:45:18','2026-07-01 18:45:18'),(6,2,'2026-07-01 20:06:27','2026-07-01 20:06:27');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'GAMING','2026-06-26 09:32:06','2026-06-26 09:32:06'),(2,'BUSINESS','2026-06-26 09:32:06','2026-06-26 09:32:06');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `adminId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `adminId` (`adminId`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`),
  CONSTRAINT `conversations_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `conversations_ibfk_4` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (2,30,27,'2026-07-01 18:54:36','2026-07-01 18:54:36'),(3,30,27,'2026-07-02 06:01:27','2026-07-02 06:01:27'),(4,30,27,'2026-07-02 06:02:04','2026-07-02 06:02:04');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversationId` int NOT NULL,
  `senderId` int NOT NULL,
  `content` text NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `conversationId` (`conversationId`),
  KEY `senderId` (`senderId`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversationId`) REFERENCES `conversations` (`id`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`),
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`conversationId`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `messages_ibfk_4` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (3,2,30,'Tôi cần hỗ trợ',0,'2026-07-01 18:55:15','2026-07-01 18:55:15'),(4,2,27,'Dạ được',0,'2026-07-01 18:55:19','2026-07-01 18:55:19'),(5,3,30,'hi',0,'2026-07-02 06:01:33','2026-07-02 06:01:33'),(6,3,27,'hello',0,'2026-07-02 06:01:38','2026-07-02 06:01:38'),(7,4,30,'hi',0,'2026-07-02 06:02:09','2026-07-02 06:02:09');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordercancellationrequests`
--

DROP TABLE IF EXISTS `ordercancellationrequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordercancellationrequests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `userId` int NOT NULL,
  `reason` text NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `approvedBy` int DEFAULT NULL,
  `adminNotes` text,
  `processedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `userId` (`userId`),
  KEY `approvedBy` (`approvedBy`),
  CONSTRAINT `ordercancellationrequests_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`),
  CONSTRAINT `ordercancellationrequests_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `ordercancellationrequests_ibfk_3` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`),
  CONSTRAINT `ordercancellationrequests_ibfk_4` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ordercancellationrequests_ibfk_5` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ordercancellationrequests_ibfk_6` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordercancellationrequests`
--

LOCK TABLES `ordercancellationrequests` WRITE;
/*!40000 ALTER TABLE `ordercancellationrequests` DISABLE KEYS */;
INSERT INTO `ordercancellationrequests` VALUES (5,29,30,'hủy','APPROVED',NULL,NULL,'2026-07-01 19:38:38','2026-07-01 19:38:38','2026-07-01 19:38:38'),(6,37,30,'Hủy','APPROVED',NULL,NULL,'2026-07-02 05:52:14','2026-07-02 05:52:14','2026-07-02 05:52:14');
/*!40000 ALTER TABLE `ordercancellationrequests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderdetailreturnrequests`
--

DROP TABLE IF EXISTS `orderdetailreturnrequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderdetailreturnrequests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderDetailId` int NOT NULL,
  `userId` int NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `adminNotes` text COLLATE utf8mb4_unicode_ci,
  `processedAt` datetime DEFAULT NULL,
  `approvedBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_odrr_orderDetailId` (`orderDetailId`),
  KEY `idx_odrr_userId` (`userId`),
  KEY `idx_odrr_approvedBy` (`approvedBy`),
  CONSTRAINT `fk_odrr_approvedBy` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_odrr_orderDetail` FOREIGN KEY (`orderDetailId`) REFERENCES `orderdetails` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_odrr_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderdetailreturnrequests`
--

LOCK TABLES `orderdetailreturnrequests` WRITE;
/*!40000 ALTER TABLE `orderdetailreturnrequests` DISABLE KEYS */;
/*!40000 ALTER TABLE `orderdetailreturnrequests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderdetails`
--

DROP TABLE IF EXISTS `orderdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderdetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `productId` int DEFAULT NULL,
  `productName` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'EXISTED',
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `productId` (`productId`),
  CONSTRAINT `orderdetails_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`),
  CONSTRAINT `orderdetails_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  CONSTRAINT `orderdetails_ibfk_3` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orderdetails_ibfk_4` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderdetails`
--

LOCK TABLES `orderdetails` WRITE;
/*!40000 ALTER TABLE `orderdetails` DISABLE KEYS */;
INSERT INTO `orderdetails` VALUES (2,2,1,'Aorus 15G',1,34990000.00,'2026-06-26 09:20:54','2026-06-26 09:20:54','EXISTED'),(5,5,1,'Aorus 15G',1,34990000.00,'2026-06-26 10:15:41','2026-06-26 10:15:41','EXISTED'),(6,5,2,'Asus ZenBook 14',1,25990000.00,'2026-06-26 10:15:41','2026-06-26 10:15:49','CANCELLED'),(7,6,5,'MSI Stealth 15M',1,32990000.00,'2026-06-27 08:38:17','2026-06-27 08:38:17','EXISTED'),(8,7,4,'Lenovo Legion 5',1,23990000.00,'2026-06-27 08:39:10','2026-06-27 08:56:52','CANCELLED'),(9,8,4,'Lenovo Legion 5',1,23990000.00,'2026-06-27 09:11:34','2026-06-27 09:11:34','EXISTED'),(10,9,3,'Dell XPS 13',1,31990000.00,'2026-06-27 09:40:36','2026-06-27 09:40:52','CANCELLED'),(11,10,2,'Asus ZenBook 14',1,25990000.00,'2026-06-27 09:42:23','2026-06-27 09:46:22','CANCELLED'),(12,11,5,'MSI Stealth 15M',1,32990000.00,'2026-06-27 09:46:39','2026-06-27 10:06:31','CANCELLED'),(13,12,5,'MSI Stealth 15M',1,32990000.00,'2026-06-27 10:21:23','2026-06-27 10:21:51','CANCELLED'),(14,13,3,'Dell XPS 13',1,31990000.00,'2026-06-27 10:22:14','2026-06-27 10:22:14','EXISTED'),(15,14,4,'Lenovo Legion 5',1,23990000.00,'2026-06-27 11:14:20','2026-06-27 11:14:41','CANCELLED'),(16,15,2,'Asus ZenBook 14',1,25990000.00,'2026-06-27 11:16:48','2026-06-27 11:16:48','EXISTED'),(17,16,2,'Asus ZenBook 14',1,25990000.00,'2026-06-28 04:10:14','2026-06-28 04:10:14','EXISTED'),(18,17,1,'Aorus 15G',1,34990000.00,'2026-06-28 04:11:03','2026-06-28 05:02:06','CANCELLED'),(19,17,4,'Lenovo Legion 5',1,23990000.00,'2026-06-28 04:11:03','2026-06-28 04:11:03','EXISTED'),(20,18,3,'Dell XPS 13',1,31990000.00,'2026-06-28 05:03:58','2026-06-28 05:03:58','EXISTED'),(30,28,14,'ASUS Zenbook 14 OLED UX3405MA-PP151W',1,28990000.00,'2026-07-01 18:46:00','2026-07-01 18:46:00','EXISTED'),(31,29,18,'MSI Cyborg 15 A13UC-2082VN',1,24990000.00,'2026-07-01 18:59:39','2026-07-01 19:38:38','CANCELLED'),(32,33,14,'ASUS Zenbook 14 OLED UX3405MA-PP151W',1,28990000.00,'2026-07-01 20:08:33','2026-07-01 20:08:41','CANCELLED'),(33,34,14,'ASUS Zenbook 14 OLED UX3405MA-PP151W',1,28990000.00,'2026-07-01 20:08:54','2026-07-01 20:08:59','CANCELLED'),(34,34,15,'Dell Gaming G16 7620',1,31490000.00,'2026-07-01 20:08:54','2026-07-01 20:08:54','EXISTED'),(35,36,18,'MSI Cyborg 15 A13UC-2082VN',1,24990000.00,'2026-07-02 03:08:02','2026-07-02 03:08:02','EXISTED'),(36,37,15,'Dell Gaming G16 7620',1,31490000.00,'2026-07-02 05:51:13','2026-07-02 05:52:14','CANCELLED'),(37,38,15,'Dell Gaming G16 7620',1,31490000.00,'2026-07-02 05:53:27','2026-07-02 05:53:27','EXISTED');
/*!40000 ALTER TABLE `orderdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderreturnrequests`
--

DROP TABLE IF EXISTS `orderreturnrequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderreturnrequests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `userId` int NOT NULL,
  `reason` text NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `adminNotes` text,
  `processedAt` datetime DEFAULT NULL,
  `approvedBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_orderreturnrequests_order` (`orderId`),
  KEY `fk_orderreturnrequests_user` (`userId`),
  KEY `fk_orderreturnrequests_approver` (`approvedBy`),
  CONSTRAINT `fk_orderreturnrequests_approver` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orderreturnrequests_order` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_orderreturnrequests_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderreturnrequests`
--

LOCK TABLES `orderreturnrequests` WRITE;
/*!40000 ALTER TABLE `orderreturnrequests` DISABLE KEYS */;
INSERT INTO `orderreturnrequests` VALUES (1,8,2,'Thích','APPROVED','OKe','2026-07-02 03:18:59',27,'2026-07-02 03:09:59','2026-07-02 03:18:59');
/*!40000 ALTER TABLE `orderreturnrequests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `voucherId` int DEFAULT NULL,
  `shipperId` int DEFAULT NULL,
  `totalAmount` decimal(15,2) NOT NULL,
  `shippingFee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `shipperFee` decimal(10,2) DEFAULT NULL,
  `shippingMethod` varchar(255) DEFAULT NULL,
  `orderStatus` enum('NEW','CONFIRMED','PREPARING','SHIPPING','DELIVERED','CANCELLED','CANCEL_REQUEST','DELIVERY_FAILED','RETURN_REQUEST','RETURNED') NOT NULL DEFAULT 'NEW',
  `shippingAddress` varchar(255) NOT NULL,
  `note` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `phoneNumber` varchar(255) NOT NULL,
  `subtotal` decimal(15,2) NOT NULL DEFAULT '0.00',
  `voucherDiscount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `pointsDiscount` decimal(15,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `voucherId` (`voucherId`),
  KEY `shipperId` (`shipperId`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`voucherId`) REFERENCES `vouchers` (`id`),
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`shipperId`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `orders_ibfk_5` FOREIGN KEY (`voucherId`) REFERENCES `vouchers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_ibfk_6` FOREIGN KEY (`shipperId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (2,2,NULL,NULL,34990000.00,0.00,NULL,'Giao hàng tiêu chuẩn','PREPARING','132','1123','2026-06-26 09:20:54','2026-06-26 09:42:50','123','123',34990000.00,0.00,0.00),(3,2,NULL,NULL,1111111.00,0.00,NULL,'Giao hàng tiêu chuẩn','PREPARING','132','Quản lý cập nhật trạng thái đơn hàng thành PREPARING','2026-06-26 10:08:03','2026-06-27 09:30:46','Nguyễn Đăng Tường','0702345039',1111111.00,0.00,0.00),(4,2,NULL,NULL,1111111.00,0.00,NULL,'Giao hàng tiêu chuẩn','PREPARING','123','1','2026-06-26 10:08:13','2026-06-26 10:09:39','Nguyễn Đăng Tường','0702345039',1111111.00,0.00,0.00),(5,2,NULL,9,34990000.00,0.00,30000.00,'Giao hàng tiêu chuẩn','SHIPPING','132','123','2026-06-26 10:15:41','2026-06-27 11:29:47','Nguyễn Đăng Tường','0702345039',34990000.00,0.00,0.00),(6,2,15,NULL,32740000.00,0.00,NULL,'Giao hàng tiêu chuẩn','CANCELLED','123','13','2026-06-27 08:38:17','2026-06-27 08:38:37','Nguyễn Đăng Tường','0702345039',32990000.00,250000.00,0.00),(7,2,NULL,NULL,0.00,0.00,NULL,'Giao hàng tiêu chuẩn','CANCELLED','132','12','2026-06-27 08:39:10','2026-06-27 08:56:52','Nguyễn Đăng Tường','0702345039',0.00,0.00,0.00),(8,2,19,9,23540000.00,0.00,30000.00,'Giao hàng tiêu chuẩn','RETURNED','123','Quản lý cập nhật trạng thái đơn hàng thành PREPARING','2026-06-27 09:11:33','2026-07-02 03:19:00','Nguyễn Đăng Tường','0702345039',23990000.00,450000.00,0.00),(9,2,NULL,NULL,0.00,0.00,NULL,'Giao hàng tiêu chuẩn','CANCELLED','123','123123','2026-06-27 09:40:36','2026-06-27 09:40:52','Nguyễn Đăng Tường','0702345039',0.00,0.00,0.00),(10,2,NULL,NULL,0.00,0.00,NULL,'Giao hàng tiêu chuẩn','CANCELLED','123',NULL,'2026-06-27 09:42:23','2026-06-27 09:46:22','Nguyễn Đăng Tường','0702345039',0.00,0.00,0.00),(11,2,NULL,NULL,32990000.00,0.00,NULL,'Giao hàng tiêu chuẩn','CANCELLED','123','Hủy đơn: hihi','2026-06-27 09:46:39','2026-06-27 10:06:31','Nguyễn Đăng Tường','0702345039',32990000.00,0.00,0.00),(12,2,NULL,NULL,32990000.00,0.00,NULL,'Giao hàng tiêu chuẩn','CANCELLED','123','Hủy đơn: a','2026-06-27 10:21:23','2026-06-27 10:21:51','Nguyễn Đăng Tường','0702345039',32990000.00,0.00,0.00),(13,2,NULL,9,31990000.00,0.00,30000.00,'Giao hàng tiêu chuẩn','DELIVERED','1','Quản lý cập nhật trạng thái đơn hàng thành PREPARING','2026-06-27 10:22:14','2026-06-27 10:22:52','Nguyễn Đăng Tường','0702345039',31990000.00,0.00,0.00),(14,2,NULL,NULL,23990000.00,0.00,NULL,'Giao hàng tiêu chuẩn','CANCELLED','123','Hủy đơn: 1','2026-06-27 11:14:20','2026-06-27 11:14:41','Nguyễn Đăng Tường','0702345039',23990000.00,0.00,0.00),(15,2,2,9,23421000.00,30000.00,30000.00,'Giao hàng tiêu chuẩn','DELIVERED','123','Quản lý cập nhật trạng thái đơn hàng thành CONFIRMED','2026-06-27 11:16:48','2026-06-27 11:25:07','Nguyễn Đăng Tường','0702345039',25990000.00,2599000.00,0.00),(16,2,NULL,NULL,25990000.00,0.00,NULL,'Giao hàng tiêu chuẩn','CANCELLED','132','123','2026-06-28 04:10:14','2026-06-28 04:10:35','Nguyễn Đăng Tường','0702345039',25990000.00,0.00,0.00),(17,2,NULL,9,23990000.00,0.00,30000.00,'Giao hàng tiêu chuẩn','SHIPPING','123','123','2026-06-28 04:11:03','2026-06-28 05:13:44','Nguyễn Đăng Tường','0702345039',23990000.00,0.00,0.00),(18,2,3,9,27221500.00,30000.00,30000.00,'Giao hàng tiêu chuẩn','SHIPPING','132','123','2026-06-28 05:03:58','2026-07-01 18:57:32','Nguyễn Đăng Tường','0702345039',31990000.00,4798500.00,0.00),(28,30,NULL,9,29020000.00,30000.00,30000.00,'Giao hàng tiêu chuẩn','DELIVERED','2 street 6 Linh Chieu, Thu Duc','Quản lý cập nhật trạng thái đơn hàng thành PREPARING','2026-07-01 18:46:00','2026-07-01 18:57:42','Nguyễn Trí','0346500557',28990000.00,0.00,0.00),(29,30,33,NULL,22421000.00,30000.00,NULL,'Giao hàng tiêu chuẩn','CANCELLED','2 street 6 Linh Chieu, Thu Duc','Hủy đơn: hủy','2026-07-01 18:59:39','2026-07-01 19:38:38','Nguyễn Trí','0346500557',24990000.00,2499000.00,100000.00),(33,2,NULL,NULL,0.00,30000.00,NULL,'Giao hàng tiêu chuẩn','CANCELLED','123 nVs',NULL,'2026-07-01 20:08:33','2026-07-01 20:08:41','Nguyễn Hữu Trí','0346500557',0.00,0.00,0.00),(34,2,NULL,NULL,31490000.00,30000.00,NULL,'Giao hàng tiêu chuẩn','CONFIRMED','123 nVs',NULL,'2026-07-01 20:08:54','2026-07-02 03:06:34','Nguyễn Hữu Trí','0346500557',31490000.00,0.00,0.00),(36,2,NULL,9,25020000.00,30000.00,30000.00,'Giao hàng tiêu chuẩn','SHIPPING','123 nVs',NULL,'2026-07-02 03:08:02','2026-07-02 05:58:00','Nguyễn Hữu Trí','0346500557',24990000.00,0.00,0.00),(37,30,33,NULL,28271000.00,30000.00,NULL,'Giao hàng tiêu chuẩn','CANCELLED','123 nVs','Hủy đơn: Hủy','2026-07-02 05:51:13','2026-07-02 05:52:14','Nguyễn Hữu Trí','0346500557',31490000.00,3149000.00,100000.00),(38,30,NULL,9,31420000.00,30000.00,30000.00,'Giao hàng tiêu chuẩn','DELIVERED','123 nVs','Quản lý cập nhật trạng thái đơn hàng thành PREPARING','2026-07-02 05:53:27','2026-07-02 05:58:33','Nguyễn Hữu Trí','0346500557',31490000.00,0.00,100000.00);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderstatushistories`
--

DROP TABLE IF EXISTS `orderstatushistories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderstatushistories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `status` varchar(255) NOT NULL,
  `note` text,
  `changedBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `changedBy` (`changedBy`),
  CONSTRAINT `orderstatushistories_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orderstatushistories_ibfk_2` FOREIGN KEY (`changedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderstatushistories`
--

LOCK TABLES `orderstatushistories` WRITE;
/*!40000 ALTER TABLE `orderstatushistories` DISABLE KEYS */;
INSERT INTO `orderstatushistories` VALUES (1,2,'CONFIRMED','Quản lý cập nhật trạng thái đơn hàng thành CONFIRMED',8,'2026-06-26 09:42:29','2026-06-26 09:42:29'),(2,2,'PREPARING','Quản lý cập nhật trạng thái đơn hàng thành PREPARING',8,'2026-06-26 09:42:50','2026-06-26 09:42:50'),(3,4,'CONFIRMED','Quản lý cập nhật trạng thái đơn hàng thành CONFIRMED',8,'2026-06-26 10:09:19','2026-06-26 10:09:19'),(4,4,'PREPARING','Quản lý cập nhật trạng thái đơn hàng thành PREPARING',8,'2026-06-26 10:09:39','2026-06-26 10:09:39'),(5,5,'CONFIRMED','Quản lý cập nhật trạng thái đơn hàng thành CONFIRMED',8,'2026-06-26 10:16:25','2026-06-26 10:16:25'),(6,5,'PREPARING','Quản lý cập nhật trạng thái đơn hàng thành PREPARING',8,'2026-06-26 10:18:13','2026-06-26 10:18:13'),(7,6,'CANCELLED','Quản lý cập nhật trạng thái đơn hàng thành CANCELLED',8,'2026-06-27 08:38:37','2026-06-27 08:38:37'),(8,7,'CONFIRMED','Quản lý cập nhật trạng thái đơn hàng thành CONFIRMED',8,'2026-06-27 08:39:16','2026-06-27 08:39:16'),(9,8,'CONFIRMED','Quản lý cập nhật trạng thái đơn hàng thành CONFIRMED',8,'2026-06-27 09:12:28','2026-06-27 09:12:28'),(10,8,'PREPARING','Quản lý cập nhật trạng thái đơn hàng thành PREPARING',8,'2026-06-27 09:12:43','2026-06-27 09:12:43'),(11,8,'CONFIRMED','Từ chối yêu cầu hủy đơn từ khách hàng. Ghi chú: cc',8,'2026-06-27 09:22:28','2026-06-27 09:22:28'),(12,8,'PREPARING','Quản lý cập nhật trạng thái đơn hàng thành PREPARING',8,'2026-06-27 09:28:32','2026-06-27 09:28:32'),(13,3,'PREPARING','Quản lý cập nhật trạng thái đơn hàng thành PREPARING',8,'2026-06-27 09:30:46','2026-06-27 09:30:46'),(14,8,'SHIPPING','Giao shipper Nguyễn Đăng Tường vận chuyển đơn hàng.',8,'2026-06-27 09:31:55','2026-06-27 09:31:55'),(15,12,'CONFIRMED','Quản lý cập nhật trạng thái đơn hàng thành CONFIRMED',8,'2026-06-27 10:21:47','2026-06-27 10:21:47'),(16,13,'CONFIRMED','Quản lý cập nhật trạng thái đơn hàng thành CONFIRMED',8,'2026-06-27 10:22:18','2026-06-27 10:22:18'),(17,13,'PREPARING','Quản lý cập nhật trạng thái đơn hàng thành PREPARING',8,'2026-06-27 10:22:18','2026-06-27 10:22:18'),(18,13,'SHIPPING','Giao shipper Nguyễn Đăng Tường vận chuyển đơn hàng.',8,'2026-06-27 10:22:21','2026-06-27 10:22:21'),(19,15,'CONFIRMED','Quản lý cập nhật trạng thái đơn hàng thành CONFIRMED',8,'2026-06-27 11:16:59','2026-06-27 11:16:59'),(20,5,'SHIPPING','Giao shipper Nguyễn Đăng Tường vận chuyển đơn hàng.',8,'2026-06-27 11:29:47','2026-06-27 11:29:47'),(21,16,'CANCELLED','Quản lý cập nhật trạng thái đơn hàng thành CANCELLED',8,'2026-06-28 04:10:35','2026-06-28 04:10:35'),(25,28,'CONFIRMED','Quản lý cập nhật trạng thái đơn hàng thành CONFIRMED',27,'2026-07-01 18:51:59','2026-07-01 18:51:59'),(26,28,'PREPARING','Quản lý cập nhật trạng thái đơn hàng thành PREPARING',27,'2026-07-01 18:52:11','2026-07-01 18:52:11'),(27,28,'SHIPPING','Giao shipper Nguyễn Đăng Tường vận chuyển đơn hàng.',27,'2026-07-01 18:52:39','2026-07-01 18:52:39'),(28,38,'CONFIRMED','Quản lý cập nhật trạng thái đơn hàng thành CONFIRMED',27,'2026-07-02 05:53:38','2026-07-02 05:53:38'),(29,38,'PREPARING','Quản lý cập nhật trạng thái đơn hàng thành PREPARING',27,'2026-07-02 05:54:03','2026-07-02 05:54:03'),(30,38,'SHIPPING','Giao shipper Nguyễn Đăng Tường vận chuyển đơn hàng.',27,'2026-07-02 05:57:38','2026-07-02 05:57:38');
/*!40000 ALTER TABLE `orderstatushistories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `method` enum('COD','MOMO','VNPAY','ZALOPAY') DEFAULT 'COD',
  `status` enum('PENDING','PROCESSING','PAID','FAILED','REFUNDED') DEFAULT 'PENDING',
  `amount` decimal(15,2) NOT NULL,
  `transactionId` varchar(255) DEFAULT NULL,
  `paidAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (2,2,'COD','PENDING',34990000.00,NULL,NULL,'2026-06-26 09:20:54','2026-06-26 09:20:54'),(3,3,'VNPAY','PENDING',1111111.00,NULL,NULL,'2026-06-26 10:08:03','2026-06-26 10:08:03'),(4,4,'COD','PENDING',1111111.00,NULL,NULL,'2026-06-26 10:08:13','2026-06-26 10:08:13'),(5,5,'COD','PENDING',60980000.00,NULL,NULL,'2026-06-26 10:15:41','2026-06-26 10:15:41'),(6,6,'COD','PENDING',32740000.00,NULL,NULL,'2026-06-27 08:38:17','2026-06-27 08:38:17'),(7,7,'COD','PENDING',23990000.00,NULL,NULL,'2026-06-27 08:39:10','2026-06-27 08:39:10'),(8,8,'COD','PENDING',23540000.00,NULL,NULL,'2026-06-27 09:11:34','2026-06-27 09:11:34'),(9,9,'COD','PENDING',31990000.00,NULL,NULL,'2026-06-27 09:40:36','2026-06-27 09:40:36'),(10,10,'COD','PENDING',25990000.00,NULL,NULL,'2026-06-27 09:42:23','2026-06-27 09:42:23'),(11,11,'COD','PENDING',32990000.00,NULL,NULL,'2026-06-27 09:46:39','2026-06-27 09:46:39'),(12,12,'COD','PENDING',32990000.00,NULL,NULL,'2026-06-27 10:21:23','2026-06-27 10:21:23'),(13,13,'COD','PENDING',31990000.00,NULL,NULL,'2026-06-27 10:22:14','2026-06-27 10:22:14'),(14,14,'COD','PENDING',23990000.00,NULL,NULL,'2026-06-27 11:14:20','2026-06-27 11:14:20'),(15,15,'COD','PENDING',23421000.00,NULL,NULL,'2026-06-27 11:16:48','2026-06-27 11:16:48'),(16,16,'COD','PENDING',25990000.00,NULL,NULL,'2026-06-28 04:10:14','2026-06-28 04:10:14'),(17,17,'COD','PENDING',58980000.00,NULL,NULL,'2026-06-28 04:11:03','2026-06-28 04:11:03'),(18,18,'VNPAY','PENDING',27221500.00,NULL,NULL,'2026-06-28 05:03:58','2026-06-28 05:03:58'),(28,28,'VNPAY','PENDING',29020000.00,NULL,NULL,'2026-07-01 18:46:00','2026-07-01 18:46:00'),(29,29,'COD','PENDING',22421000.00,NULL,NULL,'2026-07-01 18:59:39','2026-07-01 18:59:39'),(30,33,'COD','PENDING',29020000.00,NULL,NULL,'2026-07-01 20:08:33','2026-07-01 20:08:33'),(31,34,'COD','PENDING',60510000.00,NULL,NULL,'2026-07-01 20:08:54','2026-07-01 20:08:54'),(32,36,'COD','PENDING',25020000.00,NULL,NULL,'2026-07-02 03:08:02','2026-07-02 03:08:02'),(33,37,'VNPAY','PENDING',28271000.00,NULL,NULL,'2026-07-02 05:51:13','2026-07-02 05:51:13'),(34,38,'COD','PENDING',31420000.00,NULL,NULL,'2026-07-02 05:53:27','2026-07-02 05:53:27');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_review_images`
--

DROP TABLE IF EXISTS `product_review_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_review_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productReviewId` int NOT NULL,
  `imageUrl` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productReviewId` (`productReviewId`),
  CONSTRAINT `product_review_images_ibfk_1` FOREIGN KEY (`productReviewId`) REFERENCES `product_reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_review_images`
--

LOCK TABLES `product_review_images` WRITE;
/*!40000 ALTER TABLE `product_review_images` DISABLE KEYS */;
INSERT INTO `product_review_images` VALUES (3,32,'/uploads/reviews/reviews-1782932337568-149860028.png','2026-07-01 18:58:57','2026-07-01 18:58:57');
/*!40000 ALTER TABLE `product_review_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `productId` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `rewardType` enum('points','coupon') NOT NULL DEFAULT 'points',
  `rewardValue` int DEFAULT NULL,
  `rewardToken` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `orderId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `productId` (`productId`),
  CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `product_reviews_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_reviews_ibfk_5` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
INSERT INTO `product_reviews` VALUES (1,2,3,5,'hay','points',NULL,NULL,'2026-06-27 10:35:44','2026-06-27 10:35:44',13),(32,30,14,5,'Được','points',100000,'514e330b72f469e86a529dd7bb5dab04','2026-07-01 18:58:57','2026-07-01 18:59:00',28),(33,30,15,5,'','points',100000,'49747200e602b797386ac047a10a4328','2026-07-02 05:58:44','2026-07-02 05:58:46',38);
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productimages`
--

DROP TABLE IF EXISTS `productimages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productimages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `imageUrl` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  CONSTRAINT `productimages_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productimages`
--

LOCK TABLES `productimages` WRITE;
/*!40000 ALTER TABLE `productimages` DISABLE KEYS */;
INSERT INTO `productimages` VALUES (1,1,'/uploads/laptop/Aorus/aorus-15g-thumb.jpg','2026-05-14 15:20:55','2026-05-14 15:20:55'),(2,1,'/uploads/laptop/Aorus/aorus-15g-1.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(3,1,'/uploads/laptop/Aorus/aorus-15g-2.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(4,1,'/uploads/laptop/Aorus/aorus-15g-3.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(5,1,'/uploads/laptop/Aorus/aorus-15g-4.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(6,1,'/uploads/laptop/Aorus/aorus-15g-5.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(7,1,'/uploads/laptop/Aorus/aorus-15g-6.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(8,2,'/uploads/laptop/Asus/asus-zenbook-14-thumb.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(9,2,'/uploads/laptop/Asus/asus-zenbook-14-1.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(10,2,'/uploads/laptop/Asus/asus-zenbook-14-2.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(11,2,'/uploads/laptop/Asus/asus-zenbook-14-3.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(12,2,'/uploads/laptop/Asus/asus-zenbook-14-4.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(13,3,'/uploads/laptop/Dell/dell-xps-13-thumb.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(14,3,'/uploads/laptop/Dell/dell-xps-13-1.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(15,3,'/uploads/laptop/Dell/dell-xps-13-2.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(16,3,'/uploads/laptop/Dell/dell-xps-13-3.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(17,4,'/uploads/laptop/Lenovo/lenovo-legion-5-thumb.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(18,4,'/uploads/laptop/Lenovo/lenovo-legion-5-1.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(19,4,'/uploads/laptop/Lenovo/lenovo-legion-5-2.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(20,4,'/uploads/laptop/Lenovo/lenovo-legion-5-3.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(21,5,'/uploads/laptop/MSI/msi-stealth-15m-thumb.png','2026-05-14 15:20:55','2026-05-14 15:20:55'),(22,5,'/uploads/laptop/MSI/msi-stealth-15m-1.png','2026-05-14 15:20:55','2026-05-14 15:20:55'),(23,5,'/uploads/laptop/MSI/msi-stealth-15m-2.png','2026-05-14 15:20:55','2026-05-14 15:20:55'),(24,5,'/uploads/laptop/MSI/msi-stealth-15m-3.png','2026-05-14 15:20:55','2026-05-14 15:20:55'),(25,6,'/uploads/laptop/Macbook/apple-macbook-air-m2-thumb.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(26,6,'/uploads/laptop/Macbook/apple-macbook-air-m2-1.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(27,6,'/uploads/laptop/Macbook/apple-macbook-air-m2-2.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(28,6,'/uploads/laptop/Macbook/apple-macbook-air-m2-3.webp','2026-05-14 15:20:55','2026-05-14 15:20:55'),(36,12,'/uploads/laptop/Asus/asus-rogstrix616/rog-strix-g16-thumb.webp','2026-06-29 16:48:26','2026-06-29 16:48:26'),(37,12,'/uploads/laptop/Asus/asus-rogstrix616/rog-strix-g16-1.webp','2026-06-29 16:48:26','2026-06-29 16:48:26'),(38,12,'/uploads/laptop/Asus/asus-rogstrix616/rog-strix-g16-2.webp','2026-06-29 16:48:26','2026-06-29 16:48:26'),(39,12,'/uploads/laptop/Asus/asus-rogstrix616/rog-strix-g16-3.webp','2026-06-29 16:48:26','2026-06-29 16:48:26'),(40,13,'/uploads/laptop/Asus/tuf-gaming-a15/tuf-gaming-a15-thumb.webp','2026-06-29 16:49:46','2026-06-29 16:49:46'),(41,13,'/uploads/laptop/Asus/tuf-gaming-a15/tuf-gaming-a15-1.webp','2026-06-29 16:49:46','2026-06-29 16:49:46'),(42,13,'/uploads/laptop/Asus/tuf-gaming-a15/tuf-gaming-a15-2.webp','2026-06-29 16:49:46','2026-06-29 16:49:46'),(43,13,'/uploads/laptop/Asus/tuf-gaming-a15/tuf-gaming-a15-3.webp','2026-06-29 16:49:46','2026-06-29 16:49:46'),(44,14,'/uploads/laptop/Asus/zenbook-14-oled/zenbook-14-oled-thumb.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(45,14,'/uploads/laptop/Asus/zenbook-14-oled/zenbook-14-oled-1.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(46,14,'/uploads/laptop/Asus/zenbook-14-oled/zenbook-14-oled-2.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(47,14,'/uploads/laptop/Asus/zenbook-14-oled/zenbook-14-oled-3.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(48,15,'/uploads/laptop/Dell/dell-g16/dell-g16-thumb.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(49,15,'/uploads/laptop/Dell/dell-g16/dell-g16-1.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(50,15,'/uploads/laptop/Dell/dell-g16/dell-g16-2.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(51,15,'/uploads/laptop/Dell/dell-g16/dell-g16-3.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(52,16,'/uploads/laptop/Lenovo/loq-15/loq-15-thumb.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(53,16,'/uploads/laptop/Lenovo/loq-15/loq-15-1.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(54,16,'/uploads/laptop/Lenovo/loq-15/loq-15-2.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(55,16,'/uploads/laptop/Lenovo/loq-15/loq-15-3.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(56,17,'/uploads/laptop/MSI/katana-15/katana-15-thumb.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(57,17,'/uploads/laptop/MSI/katana-15/katana-15-1.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(58,17,'/uploads/laptop/MSI/katana-15/katana-15-2.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(59,17,'/uploads/laptop/MSI/katana-15/katana-15-3.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(60,18,'/uploads/laptop/MSI/cyborg-15/cyborg-15-thumb.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(61,18,'/uploads/laptop/MSI/cyborg-15/cyborg-15-1.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(62,18,'/uploads/laptop/MSI/cyborg-15/cyborg-15-2.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(63,18,'/uploads/laptop/MSI/cyborg-15/cyborg-15-3.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(64,19,'/uploads/laptop/Apple/macbook-air-m4/macbook-air-m4-thumb.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(65,19,'/uploads/laptop/Apple/macbook-air-m4/macbook-air-m4-1.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(66,19,'/uploads/laptop/Apple/macbook-air-m4/macbook-air-m4-2.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(67,19,'/uploads/laptop/Apple/macbook-air-m4/macbook-air-m4-3.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(68,20,'/uploads/laptop/Asus/vivobook-s14-oled/vivobook-s14-oled-thumb.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(69,20,'/uploads/laptop/Asus/vivobook-s14-oled/vivobook-s14-oled-1.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(70,20,'/uploads/laptop/Asus/vivobook-s14-oled/vivobook-s14-oled-2.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(71,20,'/uploads/laptop/Asus/vivobook-s14-oled/vivobook-s14-oled-3.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(72,21,'/uploads/laptop/Dell/inspiron-14-plus/inspiron-14-plus-thumb.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(73,21,'/uploads/laptop/Dell/inspiron-14-plus/inspiron-14-plus-1.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(74,21,'/uploads/laptop/Dell/inspiron-14-plus/inspiron-14-plus-2.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(75,21,'/uploads/laptop/Dell/inspiron-14-plus/inspiron-14-plus-3.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(76,22,'/uploads/laptop/Lenovo/thinkbook-14-g7/thinkbook-14-g7-thumb.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(77,22,'/uploads/laptop/Lenovo/thinkbook-14-g7/thinkbook-14-g7-1.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(78,22,'/uploads/laptop/Lenovo/thinkbook-14-g7/thinkbook-14-g7-2.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(79,22,'/uploads/laptop/Lenovo/thinkbook-14-g7/thinkbook-14-g7-3.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(80,23,'/uploads/laptop/MSI/msi-thin-15/msi-thin-15-thumb.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(81,23,'/uploads/laptop/MSI/msi-thin-15/msi-thin-15-1.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(82,23,'/uploads/laptop/MSI/msi-thin-15/msi-thin-15-2.webp','2026-06-29 17:18:02','2026-06-29 17:18:02'),(83,23,'/uploads/laptop/MSI/msi-thin-15/msi-thin-15-3.webp','2026-06-29 17:18:02','2026-06-29 17:18:02');
/*!40000 ALTER TABLE `productimages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `description` text,
  `stock` int NOT NULL DEFAULT '0',
  `sold` int NOT NULL DEFAULT '0',
  `thumbnail` varchar(255) DEFAULT NULL,
  `ram` int DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `brandId` int NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `brandId` (`brandId`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`brandId`) REFERENCES `brands` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Aorus 15G',34990000.00,'Laptop gaming mạnh mẽ với CPU Intel Core i7 và GPU RTX 3070.',6,5,'/uploads/laptop/Aorus/aorus-15g-thumb.jpg',16,'GAMING',1,1,'2026-05-13 16:02:37','2026-06-28 09:16:35'),(2,'Asus ZenBook 14',25990000.00,'Ultrabook mỏng nhẹ, pin tốt và màn hình OLED sắc nét.',11,8,'/uploads/laptop/Asus/asus-zenbook-14-thumb.webp',16,'GAMING',2,1,'2026-05-13 16:02:37','2026-06-28 10:18:55'),(3,'Dell XPS 13',31990000.00,'Thiết kế cao cấp, cấu hình ổn định cho công việc văn phòng.',16,12,'/uploads/laptop/Dell/dell-xps-13-thumb.webp',32,'BUSINESS',3,1,'2026-05-13 16:02:37','2026-06-28 09:19:42'),(4,'Lenovo Legion 5',23990000.00,'Laptop gaming phổ thông, cấu hình ổn định và tản nhiệt tốt.',39,15,'/uploads/laptop/Lenovo/lenovo-legion-5-thumb.webp',32,'GAMING',5,1,'2026-05-13 16:02:37','2026-07-02 03:19:00'),(5,'MSI Stealth 15M',32990000.00,'Chiếc laptop gaming mỏng nhẹ với hiệu năng cao.',18,7,'/uploads/laptop/MSI/msi-stealth-15m-thumb.png',16,'GAMING',6,1,'2026-05-13 16:02:37','2026-06-27 10:21:51'),(6,'Apple MacBook Air M2',36990000.00,'MacBook Air với chip M2, hiệu năng và pin xuất sắc.',12,9,'/uploads/laptop/Macbook/apple-macbook-air-m2-thumb.webp',32,'BUSINESS',7,1,'2026-05-13 16:02:37','2026-05-13 16:02:37'),(12,'ASUS ROG Strix G16 RTX 4060',32990000.00,'Laptop gaming cao cấp sở hữu Intel Core i7 cùng NVIDIA GeForce RTX 4060. Màn hình 16 inch tần số quét cao cho trải nghiệm chơi game mượt mà, hệ thống tản nhiệt tối ưu giúp duy trì hiệu năng ổn định trong thời gian dài.',25,18,'/uploads/laptop/Asus/asus-rogstrix616/rog-strix-g16-thumb.webp',16,'Gaming',2,1,'2026-06-29 16:48:04','2026-06-29 16:48:04'),(13,'ASUS TUF Gaming A15 RTX 4060',25990000.00,'Laptop gaming bền bỉ với AMD Ryzen 7 và RTX 4060. Thiết kế chuẩn quân đội, màn hình 144Hz cùng khả năng nâng cấp linh hoạt đáp ứng tốt nhu cầu học tập, làm việc và giải trí.',30,20,'/uploads/laptop/Asus/tuf-gaming-a15/tuf-gaming-a15-thumb.webp',16,'Gaming',2,1,'2026-06-29 16:49:29','2026-06-29 16:49:29'),(14,'ASUS Zenbook 14 OLED UX3405MA-PP151W',28990000.00,'ASUS Zenbook 14 OLED UX3405MA sở hữu thiết kế mỏng nhẹ cao cấp, màn hình OLED 3K sắc nét cùng vi xử lý Intel Core Ultra hiện đại. Đây là lựa chọn lý tưởng cho sinh viên, nhân viên văn phòng và người dùng thường xuyên di chuyển.',21,14,'/uploads/laptop/Asus/zenbook-14-oled/zenbook-14-oled-thumb.webp',16,'BUSINESS',2,1,'2026-06-29 17:18:02','2026-07-01 20:08:59'),(15,'Dell Gaming G16 7620',31490000.00,'Dell Gaming G16 7620 mang đến hiệu năng mạnh mẽ với Intel Core i7 và card đồ họa RTX 4060. Màn hình lớn độ phân giải cao giúp trải nghiệm gaming và làm việc đồ họa trở nên mượt mà hơn.',14,11,'/uploads/laptop/Dell/dell-g16/dell-g16-thumb.webp',16,'GAMING',3,1,'2026-06-29 17:18:02','2026-07-02 05:53:27'),(16,'Lenovo LOQ 15ARP10E 83S0007AVN',26990000.00,'Lenovo LOQ 15 là dòng laptop gaming thế hệ mới với hiệu năng ổn định, thiết kế hiện đại và hệ thống tản nhiệt tối ưu. Phù hợp cho cả chơi game lẫn học tập kỹ thuật.',23,13,'/uploads/laptop/Lenovo/loq-15/loq-15-thumb.webp',16,'GAMING',5,1,'2026-06-29 17:18:02','2026-07-01 10:33:50'),(17,'MSI Katana 15 B13UDXK-2437VN',26890000.00,'MSI Katana 15 được thiết kế dành cho game thủ với cấu hình mạnh mẽ, màn hình tần số quét cao và khả năng nâng cấp linh hoạt. Đây là lựa chọn cân bằng giữa hiệu năng và giá thành.',20,15,'/uploads/laptop/MSI/katana-15/katana-15-thumb.webp',16,'GAMING',6,1,'2026-06-29 17:18:02','2026-06-29 17:18:02'),(18,'MSI Cyborg 15 A13UC-2082VN',24990000.00,'MSI Cyborg 15 sở hữu thiết kế tương lai độc đáo cùng hiệu năng mạnh mẽ. Máy đáp ứng tốt nhu cầu gaming, học tập và làm việc đa nhiệm.',20,12,'/uploads/laptop/MSI/cyborg-15/cyborg-15-thumb.webp',16,'GAMING',6,1,'2026-06-29 17:18:02','2026-07-02 03:08:02'),(19,'MacBook Air M4 13 inch 2025 16GB 512GB',29990000.00,'MacBook Air M4 mang đến hiệu năng vượt trội, thời lượng pin dài và thiết kế siêu mỏng nhẹ. Đây là lựa chọn hoàn hảo cho công việc văn phòng, học tập và sáng tạo nội dung.',15,9,'/uploads/laptop/Apple/macbook-air-m4/macbook-air-m4-thumb.webp',16,'BUSINESS',7,1,'2026-06-29 17:18:02','2026-06-29 17:18:02'),(20,'ASUS Vivobook S14 OLED S5406SA-PP060WS',23990000.00,'ASUS Vivobook S14 OLED nổi bật với màn hình OLED sống động, thiết kế trẻ trung và hiệu năng ổn định. Máy phù hợp cho học tập, văn phòng và giải trí hàng ngày.',23,11,'/uploads/laptop/Asus/vivobook-s14-oled/vivobook-s14-oled-thumb.webp',16,'BUSINESS',2,1,'2026-06-29 17:18:02','2026-06-29 17:18:02'),(21,'Dell Inspiron 14 Plus 7420 T9K26',22990000.00,'Dell Inspiron 14 Plus sở hữu thiết kế hiện đại, hiệu năng mạnh mẽ và màn hình chất lượng cao. Phù hợp cho nhân viên văn phòng và sinh viên cần một chiếc laptop bền bỉ.',19,10,'/uploads/laptop/Dell/inspiron-14-plus/inspiron-14-plus-thumb.webp',16,'BUSINESS',3,1,'2026-06-29 17:18:02','2026-06-29 17:18:02'),(22,'Lenovo ThinkBook 14 G7 IML 21MR006YVN',21990000.00,'Lenovo ThinkBook 14 G7 mang phong cách doanh nghiệp hiện đại với hiệu năng ổn định, thiết kế thanh lịch và độ bền cao. Thích hợp cho môi trường làm việc chuyên nghiệp.',25,16,'/uploads/laptop/Lenovo/thinkbook-14-g7/thinkbook-14-g7-thumb.webp',16,'BUSINESS',5,1,'2026-06-29 17:18:02','2026-06-29 17:18:02'),(23,'MSI Gaming Thin 15 B13UC-2081VN',21990000.00,'MSI Thin 15 là mẫu laptop gaming mỏng nhẹ với hiệu năng mạnh mẽ và thiết kế hiện đại. Máy đáp ứng tốt các tựa game phổ biến cũng như nhu cầu học tập và làm việc.',22,14,'/uploads/laptop/MSI/msi-thin-15/msi-thin-15-thumb.webp',16,'GAMING',6,1,'2026-06-29 17:18:02','2026-06-29 17:18:02');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_products`
--

DROP TABLE IF EXISTS `promotion_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion_products` (
  `promotionId` int NOT NULL,
  `productId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  KEY `promotionId` (`promotionId`),
  KEY `productId` (`productId`),
  CONSTRAINT `promotion_products_ibfk_1` FOREIGN KEY (`promotionId`) REFERENCES `promotions` (`id`),
  CONSTRAINT `promotion_products_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_products`
--

LOCK TABLES `promotion_products` WRITE;
/*!40000 ALTER TABLE `promotion_products` DISABLE KEYS */;
INSERT INTO `promotion_products` VALUES (3,1,'2026-05-13 16:02:37','2026-05-13 16:02:37'),(1,1,'2026-05-13 16:02:37','2026-05-13 16:02:37'),(1,2,'2026-05-13 16:02:37','2026-05-13 16:02:37'),(2,3,'2026-05-13 16:02:37','2026-05-13 16:02:37'),(5,6,'2026-05-13 16:02:37','2026-05-13 16:02:37');
/*!40000 ALTER TABLE `promotion_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `discountRate` int NOT NULL DEFAULT '0',
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,'Giảm 10% mùa hè',NULL,10,'2026-05-13 16:02:37','2026-06-12 16:02:37',1,'2026-05-13 16:02:37','2026-05-13 16:02:37'),(2,'Giảm 15% cho sinh viên',NULL,15,'2026-05-13 16:02:37','2026-06-12 16:02:37',1,'2026-05-13 16:02:37','2026-05-13 16:02:37'),(3,'Mua 1 tặng 1 phụ kiện',NULL,5,'2026-05-13 16:02:37','2026-06-12 16:02:37',1,'2026-05-13 16:02:37','2026-05-13 16:02:37'),(4,'Giảm giá laptop gaming',NULL,12,'2026-05-13 16:02:37','2026-06-12 16:02:37',1,'2026-05-13 16:02:37','2026-05-13 16:02:37'),(5,'Ưu đãi đặc biệt Mac',NULL,8,'2026-05-13 16:02:37','2026-06-12 16:02:37',1,'2026-05-13 16:02:37','2026-05-13 16:02:37');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refreshtokens`
--

DROP TABLE IF EXISTS `refreshtokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refreshtokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(255) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `expiresAt` datetime DEFAULT NULL,
  `revoked` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `refreshtokens_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refreshtokens`
--

LOCK TABLES `refreshtokens` WRITE;
/*!40000 ALTER TABLE `refreshtokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refreshtokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resetotps`
--

DROP TABLE IF EXISTS `resetotps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resetotps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `otp` varchar(255) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resetotps`
--

LOCK TABLES `resetotps` WRITE;
/*!40000 ALTER TABLE `resetotps` DISABLE KEYS */;
INSERT INTO `resetotps` VALUES (1,'sasue005@gmail.com','630478','2026-06-26 09:51:25','2026-06-26 09:46:25','2026-06-26 09:46:25'),(2,'sasue002@gmail.com','189111','2026-06-27 11:30:29','2026-06-27 11:25:29','2026-06-27 11:25:29'),(3,'user@gmail.com','927409','2026-06-27 11:30:53','2026-06-27 11:25:53','2026-06-27 11:25:53');
/*!40000 ALTER TABLE `resetotps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `targetType` enum('PRODUCT','ORDER','SHOP') NOT NULL,
  `targetId` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `orderId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `reviews_orderId_foreign_idx` (`orderId`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `reviews_orderId_foreign_idx` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,2,'SHOP',13,5,'[Tags: Giao hàng nhanh] ','2026-06-27 10:34:25','2026-06-27 10:34:25',NULL),(2,2,'ORDER',13,5,'hay','2026-06-27 10:34:26','2026-06-27 10:34:26',NULL),(6,30,'ORDER',28,5,'','2026-07-01 18:59:08','2026-07-01 18:59:08',NULL),(7,30,'SHOP',28,5,'','2026-07-01 18:59:11','2026-07-01 18:59:11',NULL);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reward_transactions`
--

DROP TABLE IF EXISTS `reward_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reward_transactions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` int NOT NULL,
  `type` enum('EARN','USE') NOT NULL,
  `points` int NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `orderId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `orderId` (`orderId`),
  CONSTRAINT `reward_transactions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `reward_transactions_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `reward_transactions_ibfk_4` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reward_transactions`
--

LOCK TABLES `reward_transactions` WRITE;
/*!40000 ALTER TABLE `reward_transactions` DISABLE KEYS */;
INSERT INTO `reward_transactions` VALUES ('05a6fbdd-e1fc-417f-bbd7-93b1eadd036e',30,'EARN',100000,'Nhận thưởng từ đánh giá sản phẩm #14',NULL,'2026-07-01 18:59:00'),('10c291d7-77e1-4744-a066-22e773cb2dd0',30,'USE',100000,'Sử dụng 100000 điểm cho đơn hàng #37',NULL,'2026-07-02 05:51:13'),('1cb7326a-4e9b-4763-ab10-646bbc85647d',30,'EARN',100000,'Hoàn điểm do hủy đơn hàng #37',NULL,'2026-07-02 05:52:14'),('4aa8b7b0-646e-4f5c-ad37-5bd51df2e943',30,'EARN',100000,'Nhận thưởng từ đánh giá sản phẩm #15',NULL,'2026-07-02 05:58:46'),('81c3aa64-6c13-45cd-8164-00925549d31e',30,'USE',100000,'Sử dụng 100000 điểm cho đơn hàng #29',NULL,'2026-07-01 18:59:39'),('9d8a042b-6103-44a7-bc73-c51658fb3a40',30,'EARN',100000,'Hoàn điểm do hủy đơn hàng #29',NULL,'2026-07-01 19:38:38'),('a1215d82-ffe1-4ef7-b3c9-f37446b0f224',30,'USE',100000,'Sử dụng 100000 điểm cho đơn hàng #38',NULL,'2026-07-02 05:53:27');
/*!40000 ALTER TABLE `reward_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('01_create_users_table.js'),('02_create_brands_table.js'),('03_create_products_table.js'),('04_create_vouchers_table.js'),('05_create_carts_table.js'),('06_create_wishlists_table.js'),('07_create_orders_table.js'),('08_create_payments_table.js'),('09_create_reviews_table.js'),('10_create_chat_rooms_table.js'),('11_create_messages_table.js'),('12_create_cart_items_table.js'),('13_create_reset_otps_table.js'),('14_create_order_details_table.js'),('15_create_user_vouchers_table.js'),('16_create_product_reviews_table.js'),('17_create_refresh_tokens_table.js'),('18_create_reward_transactions_table.js'),('19_create_order_cancellation_requests_table.js'),('20_create_product_images_table.js'),('20240629000000-create-product-review-images.js'),('21_create_promotions_table.js'),('22_create_promotion_products_table.js');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `systemsettings`
--

DROP TABLE IF EXISTS `systemsettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `systemsettings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text,
  `group` varchar(255) NOT NULL DEFAULT 'general',
  `label` varchar(255) NOT NULL,
  `inputType` enum('text','textarea','number','boolean','email','url') NOT NULL DEFAULT 'text',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `systemsettings`
--

LOCK TABLES `systemsettings` WRITE;
/*!40000 ALTER TABLE `systemsettings` DISABLE KEYS */;
INSERT INTO `systemsettings` VALUES (1,'storePhone','1900 0000','store','Hotline','text','2026-06-27 09:36:39','2026-06-27 09:36:39'),(2,'storeEmail','support@uteshop.vn','store','Email cửa hàng','email','2026-06-27 09:36:39','2026-06-27 09:36:39'),(3,'storeAddress','TP. Hồ Chí Minh','store','Địa chỉ cửa hàng','textarea','2026-06-27 09:36:39','2026-06-27 09:36:39'),(4,'storeName','UTESHOP','store','Tên cửa hàng','text','2026-06-27 09:36:39','2026-06-27 09:36:39'),(5,'defaultShippingFee','30000','policy','Phí ship mặc định','number','2026-06-27 09:36:39','2026-06-27 09:36:39'),(6,'warrantyPolicy','Bảo hành chính hãng theo từng sản phẩm.','policy','Chính sách bảo hành','textarea','2026-06-27 09:36:39','2026-06-27 09:36:39'),(7,'returnPolicy','Hỗ trợ đổi trả trong 7 ngày nếu sản phẩm lỗi từ nhà sản xuất.','policy','Chính sách đổi trả','textarea','2026-06-27 09:36:39','2026-06-27 09:36:39'),(8,'maintenanceMode','false','system','Chế độ bảo trì','boolean','2026-06-27 09:36:39','2026-06-27 09:36:39');
/*!40000 ALTER TABLE `systemsettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(11) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('admin','manager','shipper','user') NOT NULL DEFAULT 'user',
  `status` enum('ACTIVE','LOCKED') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `points` int NOT NULL DEFAULT '0',
  `refreshToken` varchar(255) DEFAULT NULL,
  `refreshTokenExpiresAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'UserUpdated Nhom13','user@gmail.com','$2b$10$R1P2Zyiz/jDnEhdUa4d/G.jpRdMlMz7Got6tm7xk7/FzU/tGOTz1K','0912345678','https://example.com/avatar.png','user','ACTIVE','2026-05-07 20:57:33','2026-07-02 03:52:39',NULL,NULL,0,NULL,NULL),(6,'Shop Four','shop4@example.com','$2b$10$R1P2Zyiz/jDnEhdUa4d/G.jpRdMlMz7Got6tm7xk7/FzU/tGOTz1K','0912345678',NULL,'user','ACTIVE','2026-06-19 02:11:02','2026-06-19 02:11:02',NULL,NULL,0,NULL,NULL),(7,'Shop Five','shop5@example.com','$2b$10$R1P2Zyiz/jDnEhdUa4d/G.jpRdMlMz7Got6tm7xk7/FzU/tGOTz1K','0987654321',NULL,'user','ACTIVE','2026-06-19 02:11:02','2026-06-19 02:11:02',NULL,NULL,0,NULL,NULL),(8,'123','sasue005@gmail.com','$2b$10$R1P2Zyiz/jDnEhdUa4d/G.jpRdMlMz7Got6tm7xk7/FzU/tGOTz1K','0123132123',NULL,'manager','ACTIVE','2026-06-26 08:11:09','2026-06-29 10:03:19',NULL,'MALE',0,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwicm9sZSI6Im1hbmFnZXIiLCJpYXQiOjE3ODI3MjczOTksImV4cCI6MTc4MzMzMjE5OX0.T_7vAgyb3yOE7S2m02QfD18wql4fVPaYFNQ_agPjTLs','2026-07-06 10:03:19'),(9,'Nguyễn Đăng Tường','sasue002@gmail.com','$2b$10$R1P2Zyiz/jDnEhdUa4d/G.jpRdMlMz7Got6tm7xk7/FzU/tGOTz1K','0702345039',NULL,'shipper','ACTIVE','2026-06-27 09:29:53','2026-07-02 05:59:15','2 street 6 Linh Chieu, Thu Duc',NULL,0,NULL,NULL),(26,'Administrator','admin@gmail.com','$2b$10$R1P2Zyiz/jDnEhdUa4d/G.jpRdMlMz7Got6tm7xk7/FzU/tGOTz1K','0900000001',NULL,'admin','ACTIVE','2026-06-29 15:14:22','2026-07-02 05:32:55',NULL,NULL,0,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjYsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4Mjk3MDM3NSwiZXhwIjoxNzgzNTc1MTc1fQ.wvKtcUbvkiWwA6BnC8QXX8mSWDifbHowUJRFh6LBhH0','2026-07-09 05:32:55'),(27,'Manager','manager@gmail.com','$2b$10$R1P2Zyiz/jDnEhdUa4d/G.jpRdMlMz7Got6tm7xk7/FzU/tGOTz1K','0900000002',NULL,'manager','ACTIVE','2026-06-29 15:14:22','2026-07-02 06:03:37',NULL,NULL,0,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjcsInJvbGUiOiJtYW5hZ2VyIiwiaWF0IjoxNzgyOTcyMjE3LCJleHAiOjE3ODM1NzcwMTd9.MQpDTFT0DPohkyYr9GIazOGbB_Yf7IMqfq4U53WP8yY','2026-07-09 06:03:37'),(28,'Shipper','shipper@gmail.com','$2b$10$R1P2Zyiz/jDnEhdUa4d/G.jpRdMlMz7Got6tm7xk7/FzU/tGOTz1K','0900000003',NULL,'shipper','ACTIVE','2026-06-29 15:14:22','2026-06-29 15:14:22',NULL,NULL,0,NULL,NULL),(30,'Nguyễn Hữu Trí','huutria22005@gmail.com','$2b$10$ts0rkkGUE2wIiJcWYXXLmOLdjTr7xMXASF9Y0o7kJ.0gBv7JKm9KK',NULL,NULL,'user','ACTIVE','2026-07-01 18:44:06','2026-07-02 06:03:39',NULL,NULL,100000,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzAsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzgyOTcyMjE5LCJleHAiOjE3ODM1NzcwMTl9.oq0Z-NWxK3S9MYyOPdSggNoGBXU7XQN3OIMmaxvx-CQ','2026-07-09 06:03:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uservouchers`
--

DROP TABLE IF EXISTS `uservouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uservouchers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `voucherId` int NOT NULL,
  `isUsed` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `voucherId` (`voucherId`),
  CONSTRAINT `uservouchers_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `uservouchers_ibfk_2` FOREIGN KEY (`voucherId`) REFERENCES `vouchers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uservouchers`
--

LOCK TABLES `uservouchers` WRITE;
/*!40000 ALTER TABLE `uservouchers` DISABLE KEYS */;
INSERT INTO `uservouchers` VALUES (48,30,33,0,'2026-07-01 18:54:04','2026-07-02 05:52:14');
/*!40000 ALTER TABLE `uservouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vouchers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `discountType` enum('PERCENT','FIXED') NOT NULL,
  `discountValue` int NOT NULL,
  `minOrderValue` int DEFAULT '0',
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vouchers`
--

LOCK TABLES `vouchers` WRITE;
/*!40000 ALTER TABLE `vouchers` DISABLE KEYS */;
INSERT INTO `vouchers` VALUES (1,'PERCENT5','PERCENT',5,100000,'2026-04-18 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(2,'PERCENT10','PERCENT',10,200000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(3,'PERCENT15','PERCENT',15,300000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(4,'PERCENT20','PERCENT',20,400000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(5,'PERCENT25','PERCENT',25,500000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(6,'PERCENT30','PERCENT',30,600000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(7,'PERCENT35','PERCENT',35,700000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(8,'PERCENT40','PERCENT',40,800000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(9,'PERCENT45','PERCENT',45,900000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(10,'PERCENT50','PERCENT',50,1000000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(11,'FIXED50K','FIXED',50000,250000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(12,'FIXED100K','FIXED',100000,500000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(13,'FIXED150K','FIXED',150000,750000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(14,'FIXED200K','FIXED',200000,1000000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(15,'FIXED250K','FIXED',250000,1250000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(16,'FIXED300K','FIXED',300000,1500000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(17,'FIXED350K','FIXED',350000,1750000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(18,'FIXED400K','FIXED',400000,2000000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(19,'FIXED450K','FIXED',450000,2250000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(20,'FIXED500K','FIXED',500000,2500000,'2026-05-31 13:16:13','2026-11-30 13:16:13',0,'2026-05-31 13:16:13','2026-05-31 13:16:13',1),(21,'SUMMER10','PERCENT',10,200000,'2024-05-01 00:00:00','2024-08-31 23:59:59',0,'2026-05-31 11:08:29','2026-05-31 11:08:29',1),(22,'SALE50K','FIXED',50000,300000,'2024-06-01 00:00:00','2024-07-31 23:59:59',0,'2026-05-31 11:08:29','2026-05-31 11:08:29',1),(23,'FREESHIP15K','FIXED',15000,100000,'2024-01-01 00:00:00','2024-12-31 23:59:59',0,'2026-05-31 11:08:29','2026-05-31 11:08:29',1),(24,'VIP20','PERCENT',20,500000,'2024-06-15 00:00:00','2024-10-15 23:59:59',0,'2026-05-31 11:08:29','2026-05-31 11:08:29',1),(25,'NEWUSER30K','FIXED',30000,0,'2024-01-01 00:00:00','2024-12-31 23:59:59',0,'2026-05-31 11:08:29','2026-05-31 11:08:29',1),(27,'WELCOME100K','FIXED',100000,2000000,'2026-06-29 17:35:28','2026-12-31 23:59:59',100,'2026-06-29 17:35:28','2026-06-29 17:35:28',1),(28,'GAMING10','PERCENT',10,10000000,'2026-06-29 17:35:28','2026-12-31 23:59:59',50,'2026-06-29 17:35:28','2026-06-29 17:35:28',1),(29,'STUDENT5','PERCENT',5,5000000,'2026-06-29 17:35:28','2026-12-31 23:59:59',100,'2026-06-29 17:35:28','2026-06-29 17:35:28',1),(30,'FREESHIP30K','FIXED',30000,1000000,'2026-06-29 17:35:28','2026-12-31 23:59:59',200,'2026-06-29 17:35:28','2026-06-29 17:35:28',1),(31,'MACBOOK15','PERCENT',15,20000000,'2026-06-29 17:35:28','2026-12-31 23:59:59',20,'2026-06-29 17:35:28','2026-06-29 17:35:28',1),(32,'123654','FIXED',10000,1000,'2026-07-06 17:00:00','2026-08-20 17:00:00',100,'2026-07-01 10:41:55','2026-07-01 10:41:55',1),(33,'312345','PERCENT',10,1000,'2026-06-30 17:00:00','2026-08-11 17:00:00',100,'2026-07-01 18:53:53','2026-07-01 18:53:53',1);
/*!40000 ALTER TABLE `vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `productId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `productId` (`productId`),
  CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
INSERT INTO `wishlists` VALUES (1,7,3,'2026-06-19 02:11:02','2026-06-19 02:11:02'),(2,7,1,'2026-06-19 02:11:02','2026-06-19 02:11:02'),(3,6,6,'2026-06-19 02:11:02','2026-06-19 02:11:02'),(6,7,5,'2026-06-19 02:11:02','2026-06-19 02:11:02'),(7,7,2,'2026-06-19 02:11:02','2026-06-19 02:11:02'),(8,6,3,'2026-06-19 02:11:02','2026-06-19 02:11:02'),(16,30,14,'2026-07-01 18:45:13','2026-07-01 18:45:13'),(17,30,15,'2026-07-02 05:50:45','2026-07-02 05:50:45');
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-12 22:32:20
