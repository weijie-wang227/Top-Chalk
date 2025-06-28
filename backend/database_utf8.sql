-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: topchalk
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
-- Table structure for table `categoriesdown`
--

DROP TABLE IF EXISTS `categoriesdown`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoriesdown` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoriesdown`
--

LOCK TABLES `categoriesdown` WRITE;
/*!40000 ALTER TABLE `categoriesdown` DISABLE KEYS */;
INSERT INTO `categoriesdown` VALUES (1,'Pace'),(2,'Delivery'),(3,'Content'),(4,'Engagement');
/*!40000 ALTER TABLE `categoriesdown` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoriesup`
--

DROP TABLE IF EXISTS `categoriesUp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoriesUp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoriesup`
--

LOCK TABLES `categoriesUp` WRITE;
/*!40000 ALTER TABLE `categoriesup` DISABLE KEYS */;
INSERT INTO `categoriesUp` VALUES (1,'Funniest'),(2,'Most Approachable'),(3,'Most Iconic');
/*!40000 ALTER TABLE `categoriesup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `downvotes`
--

DROP TABLE IF EXISTS `downvotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `downvotes` (
  `id` int NOT NULL,
  `downvote_id` int NOT NULL,
  `count` int NOT NULL,
  UNIQUE KEY `unique_downVote` (`id`,`downvote_id`),
  KEY `downvote_id` (`downvote_id`),
  CONSTRAINT `downvotes_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `downvotes_ibfk_2` FOREIGN KEY (`downvote_id`) REFERENCES `subcategoriesdown` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `downvotes`
--

LOCK TABLES `downvotes` WRITE;
/*!40000 ALTER TABLE `downvotes` DISABLE KEYS */;
INSERT INTO `downvotes` VALUES (10,1,2),(10,5,2),(10,6,1),(10,9,1);
/*!40000 ALTER TABLE `downvotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculties`
--

DROP TABLE IF EXISTS `faculties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculties`
--

LOCK TABLES `faculties` WRITE;
/*!40000 ALTER TABLE `faculties` DISABLE KEYS */;
INSERT INTO `faculties` VALUES (1,'Medicine'),(2,'Business'),(3,'Nursing');
/*!40000 ALTER TABLE `faculties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `mode` varchar(50) NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('1ddf1cd7-edb9-494d-972b-0c48ecd7102d',1,'student','2025-06-22 15:32:04'),('4950a719-97d6-4497-9838-ec37224f2a9e',1,'student','2025-06-15 15:16:36'),('929f5556-231a-4619-9f68-5178d578d6b7',10,'teacher','2025-06-20 00:06:12'),('d047de1e-c695-48a5-bcaa-a4c5d1ebfac2',1,'student','2025-06-16 21:39:11');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subcategoriesdown`
--

DROP TABLE IF EXISTS `subcategoriesdown`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subcategoriesdown` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `subcategoriesdown_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categoriesdown` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subcategoriesdown`
--

LOCK TABLES `subcategoriesdown` WRITE;
/*!40000 ALTER TABLE `subcategoriesdown` DISABLE KEYS */;
INSERT INTO `subcategoriesdown` VALUES (1,'Goes through slides too quickly',1),(2,'Spends too much time on simple concepts',1),(3,'Inconsistent pacing',1),(4,'Hard to understand due to poor enunciation or mumbling',2),(5,'Jumping between topics with no clear structure.',2),(6,'Slides are cluttered or hard to read during lectures.',2),(7,'Slides are outdated or missing key information.',3),(8,'Too much irrelevant theory, not enough practical examples.',3),(9,'Classes feel monotonous and boring.',4),(10,'Purely reads from slides.',4);
/*!40000 ALTER TABLE `subcategoriesdown` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `id` int NOT NULL,
  `faculty_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  KEY `id` (`id`),
  KEY `faculty_id` (`faculty_id`),
  CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teachers_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (2,1,'Jaundice','https://pub-760701a0839c4a9ebce469a6b5cbd2c6.r2.dev/avatars/2-63901d32-082d-4fe7-a7db-ec972023245b.jpeg'),(3,1,'Yam',NULL),(4,1,'Perk',NULL),(5,2,'Zwee',NULL),(6,2,'June',NULL),(7,2,'Tai',NULL),(8,3,'Grah',NULL),(9,3,'Shooby',NULL),(10,3,'Shazam','https://pub-760701a0839c4a9ebce469a6b5cbd2c6.r2.dev/avatars/10-4726dd86-0b47-464c-8c46-c643bcaa5368.jpeg');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `mode` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin123','123','student'),(2,'Jaundice','123','teacher'),(3,'Yam','123','teacher'),(4,'Perk','123','teacher'),(5,'Zwee','123','teacher'),(6,'June','123','teacher'),(7,'Tai','123','teacher'),(8,'Grah','123','teacher'),(9,'Shooby','123','teacher'),(10,'Shazam','123','teacher'),(11,'user','user','student');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `votes`
--

DROP TABLE IF EXISTS `votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `votes` (
  `id` int NOT NULL,
  `category_id` int NOT NULL,
  `count` int NOT NULL,
  UNIQUE KEY `unique_vote` (`id`,`category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `votes_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `votes_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categoriesup` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `votes`
--

LOCK TABLES `votes` WRITE;
/*!40000 ALTER TABLE `votes` DISABLE KEYS */;
INSERT INTO `votes` VALUES (2,3,1),(4,2,3),(9,1,1),(10,1,2),(10,2,1),(10,3,1);
/*!40000 ALTER TABLE `votes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-21 15:40:44
