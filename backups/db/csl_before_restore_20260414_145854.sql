-- MySQL dump 10.13  Distrib 9.0.0, for Win64 (x86_64)
--
-- Host: rm-2zelg8vzn3xb07mvako.mysql.rds.aliyuncs.com    Database: csl
-- ------------------------------------------------------
-- Server version	8.0.36

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'a617f17b-37ac-11f1-b113-d89424946fd8:1-3001';

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` int DEFAULT NULL,
  `likes_count` int DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post` (`post_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_parent` (`parent_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,1,10,'我也是初学者，一起进步！',NULL,0,0,'2026-03-07 22:02:24','2026-03-07 22:02:24'),(2,1,13,'请问有什么学习技巧吗？',NULL,0,0,'2026-03-06 22:02:24','2026-03-07 22:02:24'),(3,1,2,'我也是初学者，一起进步！',NULL,0,0,'2026-03-06 22:02:24','2026-03-07 22:02:24'),(4,2,13,'太棒了！我也在学习这个',NULL,0,0,'2026-03-06 22:02:24','2026-03-07 22:02:24'),(5,2,14,'请问有什么学习技巧吗？',NULL,0,0,'2026-03-06 22:02:24','2026-03-07 22:02:24'),(6,2,14,'我也是初学者，一起进步！',NULL,0,0,'2026-03-05 22:02:24','2026-03-07 22:02:24'),(7,3,12,'加油！坚持就是胜利',NULL,0,0,'2026-03-06 22:02:24','2026-03-07 22:02:24'),(8,3,10,'感谢分享，对我很有帮助',NULL,0,0,'2026-03-07 22:02:24','2026-03-07 22:02:24'),(9,3,14,'请问有什么学习技巧吗？',NULL,0,0,'2026-03-05 22:02:24','2026-03-07 22:02:24'),(10,4,12,'感谢分享，对我很有帮助',NULL,0,0,'2026-03-06 22:02:24','2026-03-07 22:02:24'),(11,4,10,'感谢分享，对我很有帮助',NULL,0,0,'2026-03-06 22:02:24','2026-03-07 22:02:24'),(12,4,2,'我也是初学者，一起进步！',NULL,0,0,'2026-03-07 22:02:24','2026-03-07 22:02:24'),(13,5,11,'加油！坚持就是胜利',NULL,0,0,'2026-03-05 22:02:24','2026-03-07 22:02:24'),(14,5,12,'加油！坚持就是胜利',NULL,0,0,'2026-03-05 22:02:24','2026-03-07 22:02:24'),(15,5,11,'我也是初学者，一起进步！',NULL,0,0,'2026-03-07 22:02:24','2026-03-07 22:02:24'),(19,1,2,'一起加油',NULL,0,0,'2026-03-08 09:54:26','2026-03-08 09:54:26'),(20,1,2,'多学多练',2,0,0,'2026-03-08 10:19:42','2026-03-08 10:19:42'),(22,6,3,'我们一起加油鸭',NULL,0,0,'2026-03-15 13:40:00','2026-03-15 13:40:00'),(23,6,3,'我们一起加油鸭',NULL,0,0,'2026-03-15 13:40:08','2026-03-15 13:40:08'),(24,6,3,'我们一起加油鸭',NULL,0,0,'2026-03-15 13:40:09','2026-03-15 13:40:09');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_members`
--

DROP TABLE IF EXISTS `group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role` enum('admin','member') COLLATE utf8mb4_unicode_ci DEFAULT 'member',
  `is_active` tinyint(1) DEFAULT '1',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_member` (`group_id`,`user_id`),
  KEY `idx_group_id` (`group_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups_table` (`id`) ON DELETE CASCADE,
  CONSTRAINT `group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='群组成员表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_members`
--

LOCK TABLES `group_members` WRITE;
/*!40000 ALTER TABLE `group_members` DISABLE KEYS */;
INSERT INTO `group_members` VALUES (1,1,1,'admin',1,'2026-04-14 05:49:25'),(2,1,2,'member',1,'2026-04-14 05:49:25'),(3,1,3,'member',1,'2026-04-14 05:49:25'),(4,1,10,'member',1,'2026-04-14 05:49:25'),(5,1,11,'member',1,'2026-04-14 05:49:25'),(6,2,2,'admin',1,'2026-04-14 05:49:25'),(7,2,1,'member',1,'2026-04-14 05:49:25'),(8,2,3,'member',1,'2026-04-14 05:49:25'),(9,3,1,'admin',1,'2026-04-14 05:49:25'),(10,3,2,'member',1,'2026-04-14 05:49:25'),(11,3,3,'member',1,'2026-04-14 05:49:25'),(12,3,10,'member',1,'2026-04-14 05:49:25'),(13,4,10,'admin',1,'2026-04-14 05:49:25'),(14,4,1,'member',1,'2026-04-14 05:49:25'),(15,4,2,'member',1,'2026-04-14 05:49:25'),(16,4,3,'member',1,'2026-04-14 05:49:25'),(17,4,11,'member',1,'2026-04-14 05:49:25'),(18,4,12,'member',1,'2026-04-14 05:49:25'),(19,4,13,'member',1,'2026-04-14 05:49:25'),(20,4,14,'member',1,'2026-04-14 05:49:25'),(21,5,3,'admin',1,'2026-04-14 05:49:25'),(22,5,1,'member',1,'2026-04-14 05:49:25'),(23,5,2,'member',1,'2026-04-14 05:49:25'),(24,5,10,'member',1,'2026-04-14 05:49:25'),(25,5,11,'member',1,'2026-04-14 05:49:25'),(26,5,12,'member',1,'2026-04-14 05:49:25'),(27,6,2,'admin',1,'2026-04-14 05:49:25'),(28,6,1,'member',1,'2026-04-14 05:49:25'),(29,6,3,'member',1,'2026-04-14 05:49:25'),(30,6,10,'member',1,'2026-04-14 05:49:25'),(31,6,11,'member',1,'2026-04-14 05:49:25'),(32,6,12,'member',1,'2026-04-14 05:49:25'),(33,6,13,'member',1,'2026-04-14 05:49:25'),(34,6,14,'member',1,'2026-04-14 05:49:25');
/*!40000 ALTER TABLE `group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups_table`
--

DROP TABLE IF EXISTS `groups_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groups_table` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '群组名称',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '群组描述',
  `avatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '群组头像',
  `type` enum('public','private') COLLATE utf8mb4_unicode_ci DEFAULT 'public' COMMENT '群组类型：公开/私密',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '群组分类',
  `creator_id` int NOT NULL COMMENT '创建者ID',
  `member_count` int DEFAULT '0' COMMENT '成员数量',
  `post_count` int DEFAULT '0' COMMENT '帖子数量',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否激活',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_type` (`type`),
  KEY `idx_category` (`category`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `groups_table_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='群组表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups_table`
--

LOCK TABLES `groups_table` WRITE;
/*!40000 ALTER TABLE `groups_table` DISABLE KEYS */;
INSERT INTO `groups_table` VALUES (1,'手语学习交流群','专注于手语学习和交流的群组',NULL,'public','学习',1,5,12,1,'2026-04-14 05:49:25','2026-04-14 05:49:25'),(2,'聋人文化分享','分享聋人文化和生活经验',NULL,'public','文化',2,3,8,1,'2026-04-14 05:49:25','2026-04-14 05:49:25'),(3,'手语翻译讨论','讨论手语翻译技巧和经验',NULL,'private','专业',1,4,6,1,'2026-04-14 05:49:25','2026-04-14 05:49:25'),(4,'初学者互助','为手语初学者提供帮助和支持',NULL,'public','学习',10,8,15,1,'2026-04-14 05:49:25','2026-04-14 05:49:25'),(5,'高级手语交流','针对有一定基础的手语学习者',NULL,'private','学习',3,6,10,1,'2026-04-14 05:49:25','2026-04-14 05:49:25'),(6,'聋健融合活动','促进聋人和健听人之间的交流',NULL,'public','社交',2,10,20,1,'2026-04-14 05:49:25','2026-04-14 05:49:25');
/*!40000 ALTER TABLE `groups_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `target_type` enum('post','comment') COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`user_id`,`target_type`,`target_id`),
  KEY `idx_target` (`target_type`,`target_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (5,2,'post',5,'2026-03-08 09:54:11'),(6,2,'post',1,'2026-03-08 09:54:13'),(9,2,'post',2,'2026-03-08 15:54:47'),(10,2,'post',4,'2026-03-08 15:54:58'),(13,3,'post',5,'2026-03-15 13:39:22');
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `author_id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('学习心得','问题求助','经验分享','其他') COLLATE utf8mb4_unicode_ci DEFAULT '其他',
  `privacy` enum('public','friends','private') COLLATE utf8mb4_unicode_ci DEFAULT 'public',
  `hashtags` json DEFAULT NULL,
  `images` json DEFAULT NULL,
  `videos` json DEFAULT NULL,
  `likes_count` int DEFAULT '0',
  `views` int DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_author` (`author_id`),
  KEY `idx_category` (`category`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,2,'今天学会了\"你好\"的手语表达','今天学会了\"你好\"的手语表达，感觉很有成就感！大家有什么学习技巧可以分享吗？#手语学习 #初学者','其他','public',NULL,NULL,NULL,1,32,0,'2026-03-06 22:02:24','2026-03-08 11:09:36'),(2,10,'分享一个学习心得','分享一个学习心得：每天坚持练习15分钟，比一次性练习2小时效果更好。循序渐进很重要！#学习心得 #坚持','其他','public',NULL,NULL,NULL,1,41,0,'2026-03-04 22:02:24','2026-03-08 15:54:48'),(3,11,'本周的挑战','本周的挑战：学会用手语表达\"今天天气很好\"。大家可以尝试一下，有问题随时提问！#挑战 #手语练习','其他','public',NULL,NULL,NULL,0,51,0,'2026-03-06 22:02:24','2026-03-07 22:02:24'),(4,12,'手语和口语的区别','手语和口语最大的区别在于，手语是视觉语言，需要用到面部表情、身体姿态和手势。学习手语不仅是学习手势，还要学习 Deaf 文化。#聋人文化 #手语差异','其他','public',NULL,NULL,NULL,1,22,0,'2026-03-04 22:02:24','2026-03-08 15:55:01'),(5,13,'推荐一个学习资源','推荐一个学习资源：YouTube上的\"Sign Language 101\"频道，讲解非常清晰，适合初学者！#学习资源 #推荐','其他','public',NULL,NULL,NULL,2,96,0,'2026-03-07 22:02:24','2026-03-15 13:39:22'),(6,2,'第一次和聋人朋友交流','今天第一次用学到的手语和聋人朋友交流，虽然很简单，但对方很耐心地纠正我的手势，这种体验太棒了！#聋健交流 #实践','其他','public',NULL,NULL,NULL,1,76,0,'2026-03-04 22:02:24','2026-03-15 14:03:54'),(7,10,'手语学习的难点','我觉得手语学习最大的难点是语法结构和口语完全不同，需要重新建立语言思维。大家有什么好的学习方法吗？#学习困难 #求助','其他','public',NULL,NULL,NULL,0,47,0,'2026-03-04 22:02:24','2026-03-07 22:02:24');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `translation_history`
--

DROP TABLE IF EXISTS `translation_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `translation_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `input_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `input_content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `result` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `confidence` float DEFAULT NULL,
  `model_used` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processing_time` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `translation_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `translation_history`
--

LOCK TABLES `translation_history` WRITE;
/*!40000 ALTER TABLE `translation_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `translation_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `role` enum('user','moderator','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT '1',
  `is_email_verified` tinyint(1) DEFAULT '0',
  `email_verification_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verification_expires` datetime DEFAULT NULL,
  `password_reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `learning_progress` json DEFAULT NULL,
  `preferences` json DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@example.com','$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW','admin',NULL,NULL,NULL,'admin',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-14 13:25:25','2026-04-14 13:43:24'),(2,'user1','user1@example.com','$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW','user1',NULL,NULL,NULL,'user',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-14 13:25:25','2026-04-14 13:43:24'),(3,'user3','user3@example.com','$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW','user3',NULL,NULL,NULL,'user',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-14 13:31:41','2026-04-14 13:43:24'),(10,'user10','user10@example.com','$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW','user10',NULL,NULL,NULL,'user',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-14 13:30:08','2026-04-14 13:43:24'),(11,'user11','user11@example.com','$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW','user11',NULL,NULL,NULL,'user',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-14 13:30:08','2026-04-14 13:43:24'),(12,'user12','user12@example.com','$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW','user12',NULL,NULL,NULL,'user',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-14 13:30:08','2026-04-14 13:43:24'),(13,'user13','user13@example.com','$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW','user13',NULL,NULL,NULL,'user',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-14 13:30:08','2026-04-14 13:43:24'),(14,'user14','user14@example.com','$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW','user14',NULL,NULL,NULL,'user',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-14 13:30:08','2026-04-14 13:43:24');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'csl'
--

--
-- Dumping routines for database 'csl'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-14 14:58:57
