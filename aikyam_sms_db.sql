-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: aikyam_sms_db
-- ------------------------------------------------------
-- Server version	8.0.33

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
-- Table structure for table `academic_years`
--

DROP TABLE IF EXISTS `academic_years`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `academic_years` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `isActive` enum('A','I') NOT NULL DEFAULT 'A',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `academicYear_name_ASC` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_years`
--

LOCK TABLES `academic_years` WRITE;
/*!40000 ALTER TABLE `academic_years` DISABLE KEYS */;
INSERT INTO `academic_years` VALUES (1,'AY2023-2024','This is the starting year','A','2023-08-29 15:10:27','2023-08-29 15:30:59'),(2,'AY2024-2025','This is the upcoming year','A','2023-08-29 15:23:25','2023-08-29 15:32:03'),(3,'AY2025-2026',NULL,'I','2023-08-29 15:23:32','2023-08-29 15:33:34'),(4,'AY2026-2027',NULL,'A','2023-08-30 16:38:48','2023-08-30 16:38:48'),(5,'AY2027-2028',NULL,'A','2023-08-30 16:39:28','2023-08-30 16:39:28'),(6,'AY2028-2029',NULL,'A','2023-09-01 16:18:04','2023-09-01 16:18:04'),(7,'AY2029-2030',NULL,'A','2023-09-01 16:18:07','2023-09-01 16:18:07'),(8,'AY2030-2031',NULL,'A','2023-09-01 16:18:07','2023-09-01 16:18:07'),(9,'AY2031-2032',NULL,'A','2023-09-01 16:18:08','2023-09-01 16:18:08'),(10,'AY2032-2033',NULL,'A','2023-09-01 16:18:09','2023-09-01 16:18:09'),(11,'AY2033-2034',NULL,'A','2023-09-01 16:18:09','2023-09-01 16:18:09');
/*!40000 ALTER TABLE `academic_years` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batches`
--

DROP TABLE IF EXISTS `batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `academicYear` varchar(20) NOT NULL,
  `type` varchar(10) NOT NULL,
  `batchCode` varchar(50) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `isActive` enum('A','I') NOT NULL DEFAULT 'A',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `programId` int DEFAULT NULL,
  `academicYearId` int DEFAULT NULL,
  `startDate` varchar(20) DEFAULT NULL,
  `endDate` varchar(20) DEFAULT NULL,
  `capacity` smallint DEFAULT NULL,
  `enrolled` smallint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `batchCode_name_ASC` (`batchCode`),
  KEY `programId` (`programId`),
  KEY `academicYearId` (`academicYearId`),
  CONSTRAINT `batches_ibfk_10` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `batches_ibfk_9` FOREIGN KEY (`programId`) REFERENCES `programs` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batches`
--

LOCK TABLES `batches` WRITE;
/*!40000 ALTER TABLE `batches` DISABLE KEYS */;
INSERT INTO `batches` VALUES (1,'AY2023-2024','core','BAT-1693408997339',NULL,'A','2023-08-30 15:23:17','2023-08-30 15:23:17',1,1,'31-08-2023','31-10-2023',50,0),(2,'AY2023-2024','core','BAT-1693496681181',NULL,'A','2023-08-31 15:44:41','2023-08-31 15:44:41',2,1,'31-08-2023','31-10-2023',200,0),(3,'AY2023-2024','elective','BAT-1693496712974',NULL,'A','2023-08-31 15:45:12','2023-08-31 15:45:12',4,1,'31-08-2023','30-09-2023',40,0);
/*!40000 ALTER TABLE `batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campuses`
--

DROP TABLE IF EXISTS `campuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `facilityName` varchar(100) NOT NULL,
  `city` varchar(30) NOT NULL,
  `state` varchar(30) DEFAULT NULL,
  `facilityAddress` varchar(300) NOT NULL,
  `contactPerson` varchar(50) NOT NULL,
  `contactPersonAddress` varchar(300) NOT NULL,
  `contactPersonPhone` varchar(20) NOT NULL,
  `contactPersonEmail` varchar(50) NOT NULL,
  `spaceDetails` json DEFAULT NULL,
  `isActive` enum('A','I') NOT NULL DEFAULT 'A',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `campus_city_ASC` (`facilityName`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campuses`
--

LOCK TABLES `campuses` WRITE;
/*!40000 ALTER TABLE `campuses` DISABLE KEYS */;
INSERT INTO `campuses` VALUES (1,'Vidaya Mandir, Mumbai','Mumbai','Maharashtra','403, Survey No. 3, Lane no. 2, Andheri East, Mumbai, Maharashtra - 400069','Mr Ram Ratan Ugale','403, Survey No. 3, Lane no. 2, Andheri East, Mumbai, Maharashtra - 400069','+91-9008812345','ram.ratan@vidyamandir.org','[{\"isActive\": 1, \"spaceTitle\": \"ABC-1\", \"typeOfSpace\": \"Traditional Class room\", \"spaceCapacity\": 40}, {\"isActive\": 0, \"spaceTitle\": \"ABC-2\", \"typeOfSpace\": \"Music Lab\", \"spaceCapacity\": 10}, {\"isActive\": 1, \"spaceTitle\": \"ABC-3\", \"typeOfSpace\": \"Recording Studio\", \"spaceCapacity\": 2}]','A','2023-04-17 14:26:07','2023-08-15 16:11:04'),(2,'Digital Music College, Nagpur','Nagpur','Maharashtra','New Subhash Nagar, Near Indian Oil Petrol Pump, Nagpur, Maharashtra - 433069','Krisnha Prakash Sharma','New Subhash Nagar, Near Indian Oil Petrol Pump, Nagpur, Maharashtra - 433069','+91-9008812345','krishna.p@dmc.org','[{\"spaceTitle\": \"CBA-1\", \"typeOfSpace\": \"Traditional Class room\", \"spaceCapacity\": 40}]','A','2023-04-17 14:29:30','2023-08-15 16:12:55'),(3,'Sound Ideaz, Andheri','Mumbai',NULL,'Andheri, Mumbai - 400001','Pramod Chandrokar','Andheri, Mumbai - 400001','9008812345','info@soundideaz.com','[{\"spaceId\": \"1692114800390\", \"isActive\": 1, \"spaceTitle\": \"TDC-1\", \"typeOfSpace\": \"Traditional Classroom\", \"spaceCapacity\": \"90\"}, {\"spaceId\": \"1692114812140\", \"isActive\": 1, \"spaceTitle\": \"SM-1\", \"typeOfSpace\": \"Seminar Hall\", \"spaceCapacity\": \"500\"}, {\"spaceId\": \"1692114822563\", \"isActive\": 1, \"spaceTitle\": \"RCS-1\", \"typeOfSpace\": \"Recording studio\", \"spaceCapacity\": \"10\"}]','A','2023-08-15 15:53:44','2023-09-02 04:52:00');
/*!40000 ALTER TABLE `campuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `courseName` varchar(100) NOT NULL,
  `courseCode` varchar(100) NOT NULL,
  `type` varchar(30) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `isActive` enum('A','I') NOT NULL DEFAULT 'A',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `programId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_code_Unique` (`courseCode`),
  KEY `course_name_ASC` (`courseName`),
  KEY `programId` (`programId`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`programId`) REFERENCES `programs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'Basics of Music','CBA-1681795178640','core','Consists of abc of Music and Musical Theories','A','2023-04-18 05:19:38','2023-04-18 05:19:38',1),(2,'Basics of Instruments','CBA-1681796279288','core','Consists of theories of Musical Instruments','A','2023-04-18 05:37:59','2023-04-18 05:37:59',1),(3,'Psychology of human listening','CBA-1681796341959','core','Consists of theories of human Psychology','A','2023-04-18 05:39:01','2023-04-18 05:39:01',2),(4,'Lighting systems in Sound','CBA-1681796399497','elective','Consists of theories of light systems','A','2023-04-18 05:39:59','2023-04-18 05:39:59',2),(5,'Theories of Sound','CBA-1693146187927','core','lorem ipsum dolor sit amet','A','2023-08-27 14:23:07','2023-08-27 14:23:07',1),(6,'Basics of Piano Instrument','CBA-1693146363612','elective','lorem ipsum dolor sit amet','A','2023-08-27 14:26:03','2023-08-27 14:26:03',4),(7,'Theories of Sound II','CBA-1693146504867','core','lorem ipsum dolor sit amet','A','2023-08-27 14:28:24','2023-08-27 14:28:24',2),(8,'Basics of Flute Instrument','CBA-1693146678092','elective','lorem ipsum dolor sit amet','A','2023-08-27 14:31:18','2023-08-27 14:31:18',9);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculty_details`
--

DROP TABLE IF EXISTS `faculty_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employeeId` varchar(20) DEFAULT NULL,
  `facultyType` varchar(20) DEFAULT NULL,
  `availability` varchar(50) DEFAULT NULL,
  `remunerationPlan` varchar(20) DEFAULT NULL,
  `academicDetails` json DEFAULT NULL,
  `accountDetails` json DEFAULT NULL,
  `careerDetails` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Employee_ID_Unique` (`employeeId`),
  KEY `userId` (`userId`),
  CONSTRAINT `faculty_details_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty_details`
--

LOCK TABLES `faculty_details` WRITE;
/*!40000 ALTER TABLE `faculty_details` DISABLE KEYS */;
INSERT INTO `faculty_details` VALUES (1,'EMP-16919245092','PROFESSIONAL','Regular','MONTHLY','{\"batch\": \"2014-2018\", \"program\": \"BSC\", \"elective\": \"environment_studies\", \"dateOfAdmission\": \"12-12-2014\"}','{\"bankName\": \"AXIS Bank\", \"bankBranch\": \"Nashik Road\", \"facultyPAN\": \"PAN1234D\", \"accoutNumber\": \"20140001234\", \"bankIFSCcode\": \"AXIS0012345\", \"facultyGSTIN\": \"GSTIN12345678IN\", \"facutlyCharges\": 14000, \"permanentAddress\": \"Nashik Road, Nashik, Maharashtra-4220053\", \"remunerationPlan\": \"MONTHLY\", \"accountHolderName\": \"Mandar Jambotkar\"}','[{\"to\": \"Apr 2019\", \"area\": \"New Delhi\", \"from\": \"Dec 2018\", \"expId\": 1, \"skills\": \"Sound Editor,Dialgoue Editor\", \"employer\": \"Beatfactory Academy\", \"designation\": \"Audio Post-Production Engineer\"}, {\"to\": \"June 2020\", \"area\": \"New Delhi\", \"from\": \"May 2018\", \"skills\": \"Teaching, singing\", \"employer\": \"Music India pvt ltd\", \"designation\": \"Music Teach\"}, {\"to\": \"June 2015\", \"area\": \"Nashik\", \"from\": \"May 2014\", \"skills\": \"Teaching\", \"employer\": \"Sound Ideaz\", \"designation\": \"Teacher\"}, {\"to\": \"June 2022\", \"area\": \"New Delhi\", \"from\": \"May 2020\", \"skills\": \"Teaching\", \"employer\": \"Teaching\", \"designation\": \"Music Teacher\"}, {\"to\": \"Present\", \"area\": \"Nashik\", \"from\": \"May 2022\", \"expId\": 4, \"skills\": \"Teaching\", \"employer\": \"Teaching\", \"designation\": \"Teacher\"}]','2023-08-13 11:01:49','2023-08-26 10:42:42',12),(2,'EMP-16919249932','AMATEUR','Weekends','WEEKLY','{\"batch\": \"2011-2013\", \"program\": \"MA\", \"elective\": \"environment_studies\", \"dateOfAdmission\": \"12-12-2014\"}','{\"bankName\": \"AXIS Bank\", \"bankBranch\": \"Kurla\", \"facultyPAN\": \"PAN1235D\", \"accoutNumber\": \"20140001244\", \"bankIFSCcode\": \"AXIS0012345\", \"facultyGSTIN\": \"GSTIN12345679IN\", \"facutlyCharges\": 14000, \"permanentAddress\": \"Kurla Bandra complex, Mumbai, Maharashtra-400012\", \"remunerationPlan\": \"MONTHLY\", \"accountHolderName\": \"Sonu Nigam\"}','[{\"to\": \"Apr 2019\", \"area\": \"New Delhi\", \"from\": \"Dec 2018\", \"expId\": 1, \"skills\": \"Sound Editor,Dialgoue Editor\", \"employer\": \"Beatfactory Academy\", \"designation\": \"Audio Post-Production Engineer\"}, {\"to\": \"Present\", \"area\": \"Mumbai\", \"from\": \"Jan 2020\", \"expId\": 2, \"skills\": \"Singer, Music composer\", \"employer\": \"T-series Mumbai\", \"designation\": \"Music Producer\"}]','2023-08-13 11:09:53','2023-08-13 11:09:53',13),(3,'EMP-16919267510','PROFESSIONAL','Weekends','MONTHLY','{\"batch\": \"2017-2020\", \"program\": \"BBA\", \"elective\": \"trends_n_reels\", \"dateOfAdmission\": \"12-12-2020\"}','{\"bankName\": \"AXIS Bank\", \"bankBranch\": \"Kurla\", \"facultyPAN\": \"PAN1236D\", \"accoutNumber\": \"20140001246\", \"bankIFSCcode\": \"AXIS0012345\", \"facultyGSTIN\": \"GSTIN12345689IN\", \"facutlyCharges\": 16000, \"permanentAddress\": \"Kurla Bandra complex, Mumbai, Maharashtra-400012\", \"remunerationPlan\": \"MONTHLY\", \"accountHolderName\": \"Shreya Deliwala\"}','[{\"to\": \"Present\", \"area\": \"Mumbai\", \"from\": \"Jan 2020\", \"expId\": 1, \"skills\": \"Reels, Video editor\", \"employer\": \"Intagram India\", \"designation\": \"Video Production\"}, {\"to\": \"June 2020\", \"area\": \"New Delhi\", \"from\": \"May 2018\", \"skills\": \"Teaching, singing\", \"employer\": \"Music India pvt ltd\", \"designation\": \"Music Teach\"}, {\"to\": \"June 2015\", \"area\": \"New Delhi\", \"from\": \"May 2014\", \"expId\": 3, \"skills\": \"Teaching\", \"employer\": \"Sound Ideaz\", \"designation\": \"Teacher\"}, {\"to\": \"Present\", \"area\": \"Pune\", \"from\": \"May 2023\", \"expId\": 4, \"skills\": \"Videography, Video Editing\", \"employer\": \"Reels India pvt ltd\", \"designation\": \"Reel Creater\"}]','2023-08-13 11:39:11','2023-08-26 10:49:14',14),(4,'EMP-16930346016','PROFESSIONAL','Rare Sessions','WEEKLY','{\"batch\": \"2014-2018\", \"program\": \"B.A. Hons.\", \"elective\": \"Flute\", \"dateOfAdmission\": \"2014-07-12\"}','{\"bankName\": \"HDFC\", \"bankBranch\": \"Jalgaon\", \"facultyPAN\": \"PAN1234D\", \"bankIFSCode\": \"IFSC0001112\", \"paymentPlan\": \"MONTHLY\", \"facultyGSTIN\": \"GSTIN001122IN\", \"accountNumber\": \"98711223344\", \"facultyCharges\": \"14000\", \"accountHolderName\": \"Radhe Shyam\", \"registeredAddress\": \"Jalgaon Maharashtra\"}','[{\"to\": \"June 2015\", \"area\": \"New Delhi\", \"from\": \"May 2014\", \"expId\": 1, \"skills\": \"Teaching\", \"employer\": \"Sound Ideaz\", \"designation\": \"Music Teacher\"}, {\"to\": \"Present\", \"area\": \"Nashik\", \"from\": \"May 2015\", \"expId\": 2, \"skills\": \"Teaching\", \"employer\": \"Sound Ideaz\", \"designation\": \"Music Teacher\"}]','2023-08-26 07:23:21','2023-08-26 10:51:25',15),(5,'EMP-16930351219','EXTERNAL','Rare Sessions','WEEKLY','{\"batch\": \"2018-2021\", \"program\": \"BCA\", \"elective\": \"EVS\", \"dateOfAdmission\": \"2018-07-19\"}','{\"bankName\": \"ICICI\", \"bankBranch\": \"Kota\", \"facultyPAN\": \"PAN1234DJ\", \"bankIFSCode\": \"IFSC0001112\", \"paymentPlan\": \"WEEKLY\", \"facultyGSTIN\": \"GSTIN001123IN\", \"accountNumber\": \"28711223344\", \"facultyCharges\": \"21000\", \"accountHolderName\": \"Nikhil Bagri\", \"registeredAddress\": \"Kota Rajsthan\"}','[{\"to\": \"June 2015\", \"area\": \"Nashik\", \"from\": \"May 2014\", \"expId\": 1, \"skills\": \"Teaching\", \"employer\": \"Teaching\", \"designation\": \"Teacher\"}, {\"to\": \"June 2015\", \"area\": \"New Delhi\", \"from\": \"May 2014\", \"expId\": 2, \"skills\": \"Teaching\", \"employer\": \"Teaching\", \"designation\": \"Music Teacher\"}]','2023-08-26 07:32:02','2023-08-27 13:33:46',16);
/*!40000 ALTER TABLE `faculty_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `programName` varchar(100) NOT NULL,
  `programCode` varchar(50) NOT NULL,
  `type` varchar(30) NOT NULL,
  `details` varchar(100) DEFAULT NULL,
  `isActive` enum('A','I') NOT NULL DEFAULT 'A',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `program_code_Unique` (`programCode`),
  KEY `program_name_ASC` (`programName`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES (1,'Diploma in Sound Engineering','ABC-1681794093934','core','Full time in campus 4 years degree program','A','2023-04-18 05:01:33','2023-09-02 05:00:20'),(2,'Bachelor in Sound Engineering','ABC-1681794122025','core','Full time in campus 4 years degree program','A','2023-04-18 05:02:02','2023-04-18 05:02:02'),(3,'Masters in Sound Engineering','ABC-1681794133354','core','Full time in campus 2 years degree program','A','2023-04-18 05:02:13','2023-04-18 05:02:13'),(4,'Piano Pioneer','ABC-1681794164589','elective','Elective certificate program','A','2023-04-18 05:02:44','2023-04-18 05:02:44'),(5,'Certificate Program Tabla Mastery','ABC-1681794199962','elective','Elective 1 year certificate program','A','2023-04-18 05:03:19','2023-04-18 05:03:19'),(6,'Certificate Program Tabla Mastery','ABC-1681794287240','elective','Elective 1 year certificate program','A','2023-04-18 05:04:47','2023-04-18 05:04:47'),(7,'Diploma in Disc Jockeying','ABC-1681794451471','core','Full time in campus 2 years Diploma program','A','2023-04-18 05:07:31','2023-04-18 05:07:31'),(8,'Degree Program','ABC-1693050635892','core','4years full time','A','2023-08-26 11:50:35','2023-08-26 11:50:35'),(9,'Flute Basics','ABC-1693050718442','elective','1year flute program','A','2023-08-26 11:51:58','2023-08-26 11:51:58'),(10,'Classroom Program','ABC-1693143141893','core','3 years full time','A','2023-08-27 13:32:21','2023-08-27 13:32:21'),(11,'Violin Program','ABC-1693143358530','elective','1 year elective','A','2023-08-27 13:35:58','2023-08-27 13:35:58');
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `description` varchar(50) NOT NULL,
  `permissions` varchar(250) DEFAULT NULL,
  `isActive` enum('A','I') NOT NULL DEFAULT 'A',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roleName` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','Admin role has all permision','ALL','A','2023-04-16 15:28:14','2023-04-16 15:28:14'),(2,'STUDENT','student role has all limited permission',NULL,'A','2023-04-16 15:29:01','2023-04-16 15:29:01'),(3,'STAFF','Staff role',NULL,'A','2023-04-16 15:29:25','2023-04-16 15:29:25'),(4,'FACULTY','Faculty role',NULL,'A','2023-04-16 15:29:40','2023-04-16 15:29:40');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_x_topic`
--

DROP TABLE IF EXISTS `session_x_topic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_x_topic` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sessionId` int DEFAULT NULL,
  `topicId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_x_topic_topicId_sessionId_unique` (`sessionId`,`topicId`),
  KEY `topicId` (`topicId`),
  CONSTRAINT `session_x_topic_ibfk_11` FOREIGN KEY (`sessionId`) REFERENCES `sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `session_x_topic_ibfk_12` FOREIGN KEY (`topicId`) REFERENCES `topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_x_topic`
--

LOCK TABLES `session_x_topic` WRITE;
/*!40000 ALTER TABLE `session_x_topic` DISABLE KEYS */;
INSERT INTO `session_x_topic` VALUES (1,1,3,'2023-08-28 14:42:02','2023-08-28 14:42:02'),(2,2,3,'2023-08-28 14:42:02','2023-08-28 14:42:02'),(3,2,4,'2023-08-28 15:28:29','2023-08-28 15:28:29'),(4,3,4,'2023-08-28 15:28:29','2023-08-28 15:28:29');
/*!40000 ALTER TABLE `session_x_topic` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sessionName` varchar(100) NOT NULL,
  `sessionCode` varchar(100) NOT NULL,
  `timeDuration` varchar(100) NOT NULL,
  `type` varchar(30) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `isActive` enum('A','I') NOT NULL DEFAULT 'A',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `courseId` int DEFAULT NULL,
  `sequence` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_code_Unique` (`sessionCode`),
  KEY `session_name_ASC` (`sessionName`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES (1,'Two weeks Music Theories','SSS-1681798467449','2 weeks','classroom','Different Theories of Music are covered during two weeks of classroom session','A','2023-04-18 06:14:27','2023-04-18 06:14:27',1,NULL),(2,'Two weeks Music Lab','SSS-1681798531397','2 weeks','lab','Introduction with musical instruemetns are covered during two weeks of lab session','A','2023-04-18 06:15:31','2023-04-18 06:15:31',1,NULL),(3,'What is music','CRS/MICROPHONES/EL/V2.5','2h','classroom','lorem ipsum dolor sit amet','A','2023-08-27 15:28:53','2023-08-27 15:28:53',2,'1 of 1'),(5,'What are notes','SSS-1693150366713','2h','classroom','lorem ipsum dolor sit amet','A','2023-08-27 15:32:46','2023-08-27 15:32:46',4,'1of1');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_details`
--

DROP TABLE IF EXISTS `student_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `U_S_ID` varchar(20) DEFAULT NULL,
  `guardianDetails` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  `academicDetails` json DEFAULT NULL,
  `accountDetails` json DEFAULT NULL,
  `attendanceDetails` json DEFAULT NULL,
  `performanceDetails` json DEFAULT NULL,
  `facultyObservations` json DEFAULT NULL,
  `custom1` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `U_S_ID_Unique` (`U_S_ID`),
  KEY `userId` (`userId`),
  CONSTRAINT `student_details_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_details`
--

LOCK TABLES `student_details` WRITE;
/*!40000 ALTER TABLE `student_details` DISABLE KEYS */;
INSERT INTO `student_details` VALUES (1,'ST-1682050031724','{\"name\": \"Sonia Gandhi\", \"email\": \"sonia.g@gmail.com\", \"gender\": \"female\", \"phone1\": \"+91-7988097593\", \"phone2\": \"\", \"relation\": \"mother\", \"localAddress\": \"1 Akbar Road New Dehi, India-110001\", \"permanentAddress\": \"1 Akbar Road New Dehi, India-110001\"}','2023-04-21 04:54:23','2023-05-22 06:53:57',2,'{\"batch\": \"2023-2024\", \"program\": \"Diploma in sound\", \"elective\": \"Harmonium\", \"dateOfAdmission\": \"01-09-2023\"}','{\"fees\": 100000, \"batch\": \"2023-2024\", \"discount\": 0, \"totalFees\": 100000, \"PDC_details\": {\"amount\": 120000, \"chq_no\": 12345, \"chq_date\": \"2023-05-23\", \"issuing_bank\": \"Bank of Baroda\"}, \"paymentPlan\": \"Installments\"}',NULL,NULL,NULL,NULL),(2,'ST-1682050160331','{\"name\": \"Sonia Gandhi\", \"email\": \"sonia.g@gmail.com\", \"gender\": \"female\", \"phone1\": \"+91-7988097593\", \"phone2\": \"\", \"relation\": \"mother\", \"localAddress\": \"1 Akbar Road New Dehi, India-110001\", \"permanentAddress\": \"1 Akbar Road New Dehi, India-110001\"}','2023-04-21 04:55:07','2023-04-21 04:55:07',3,'{\"batch\": \"2023-2024\", \"program\": \"Diploma in sound\", \"elective\": \"Harmonium\", \"dateOfAdmission\": \"01-09-2023\"}','{\"fees\": 100000, \"batch\": \"2023-2024\", \"discount\": 0, \"totalFees\": 100000, \"PDC_details\": {\"amount\": 120000, \"chq_no\": 12345, \"chq_date\": \"2023-05-23\", \"issuing_bank\": \"Bank of Baroda\"}, \"paymentPlan\": \"Installments\"}',NULL,NULL,NULL,NULL),(3,'ST-1682050347366','{\"name\": \"Rajesh Pilot\", \"email\": \"rajesh.p@gmail.com\", \"gender\": \"male\", \"phone1\": \"+91-7988097593\", \"phone2\": \"\", \"relation\": \"father\", \"localAddress\": \"1 Akbar Road Saharanpur, Uttar Pradesh, India-231001\", \"permanentAddress\": \"1 Akbar Road Saharanpur, Uttar Pradesh, India-231001\"}','2023-04-21 04:58:44','2023-04-21 04:58:44',5,'{\"batch\": \"2023-2024\", \"program\": \"Diploma in sound\", \"elective\": \"Harmonium\", \"dateOfAdmission\": \"01-09-2023\"}','{\"fees\": 100000, \"batch\": \"2023-2024\", \"discount\": 0, \"totalFees\": 100000, \"PDC_details\": {\"amount\": 120000, \"chq_no\": 12345, \"chq_date\": \"2023-05-23\", \"issuing_bank\": \"Bank of Baroda\"}, \"paymentPlan\": \"Installments\"}',NULL,NULL,NULL,NULL),(7,'ST-16940113990','{\"name\": \"Sonia Gandhi\", \"email\": \"sonia.g@gmail.com\", \"gender\": \"F\", \"phone1\": \"+91-7988097593\", \"phone2\": \"\", \"relation\": \"mother\", \"localAddress\": \"1 Akbar Road New Dehi, India-110001\", \"permanentAddress\": \"1 Akbar Road New Dehi, India-110001\"}','2023-09-06 14:43:19','2023-09-06 14:43:19',17,'{\"batch\": \"2023-2024\", \"program\": \"Diploma in sound\", \"elective\": \"Harmonium\", \"dateOfAdmission\": \"01-09-2023\"}','{\"fees\": 100000, \"batch\": \"2023-2024\", \"discount\": 0, \"totalFees\": 100000, \"PDC_details\": {\"amount\": 120000, \"chq_no\": 12345, \"chq_date\": \"2023-05-23\", \"issuing_bank\": \"Bank of Baroda\"}, \"paymentPlan\": \"Installments\"}',NULL,NULL,NULL,NULL),(8,'ST-16941840088','{\"name\": \"Mark Doe\", \"email\": \"mark.doe@gmail.com\", \"gender\": \"M\", \"phone2\": null, \"relation\": \"Father\"}','2023-09-08 14:40:09','2023-09-08 14:40:09',18,'{\"batchId\": 1, \"batchCode\": \"BAT-1693408997339\", \"dateOfAdmission\": \"2023-09-08\"}','{\"discount\": \"0\", \"paidFees\": \"20000\", \"totalFees\": \"100000\", \"pdcDetails\": \"\", \"paymentPlan\": \"YEARLY\"}',NULL,NULL,NULL,NULL),(9,'ST-16941843840','{\"name\": \"Mark Doe\", \"email\": \"mark.doe@gmail.com\", \"gender\": \"M\", \"phone2\": null, \"relation\": \"Father\"}','2023-09-08 14:46:24','2023-09-08 14:46:24',19,'{\"batchId\": 1, \"batchCode\": \"BAT-1693408997339\", \"dateOfAdmission\": \"2023-09-08\"}','{\"discount\": \"0\", \"paidFees\": \"20000\", \"totalFees\": \"100000\", \"pdcDetails\": \"\", \"paymentPlan\": \"YEARLY\"}',NULL,NULL,NULL,NULL),(10,'ST-16941883532','{\"name\": \"Liam Dowson\", \"email\": \"liam.d@gmail.com\", \"phone\": \"8923928398\", \"gender\": \"M\", \"address\": \"San Francisco\", \"relation\": \"Father\"}','2023-09-08 15:52:33','2023-09-10 14:59:35',20,'{\"batchId\": 3, \"batchCode\": \"BAT-1693496712974\", \"dateOfAdmission\": \"2023-09-08\"}','{\"discount\": \"0\", \"paidFees\": \"30000\", \"totalFees\": \"100000\", \"pdcDetails\": \"\", \"paymentPlan\": \"YEARLY\"}',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `student_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `topics`
--

DROP TABLE IF EXISTS `topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `topicName` varchar(100) NOT NULL,
  `topicCode` varchar(100) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `isActive` enum('A','I') NOT NULL DEFAULT 'A',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `courseId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `topic_code_Unique` (`topicCode`),
  KEY `topic_name_ASC` (`topicName`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `topics_ibfk_1` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topics`
--

LOCK TABLES `topics` WRITE;
/*!40000 ALTER TABLE `topics` DISABLE KEYS */;
INSERT INTO `topics` VALUES (1,'Notes of Music Theory','TPC-1681807158931','All the music notes are covered in detail','A','2023-04-18 08:39:18','2023-04-18 08:39:18',1),(2,'Basic of western music notes','TPC-1681807216679','All the western music notes are covered in detail','A','2023-04-18 08:40:16','2023-04-18 08:40:16',1),(3,'Notes of Music Theory','TPC-1693233722433','All the music notes are covered in detail','A','2023-08-28 14:42:02','2023-08-28 14:42:02',1),(4,'New Topic','TPC-1693236509665','lorem ipsum dolor sit amet','A','2023-08-28 15:28:29','2023-08-28 15:28:29',1);
/*!40000 ALTER TABLE `topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `DOB` varchar(20) NOT NULL,
  `gender` enum('M','F','O') NOT NULL,
  `email` varchar(60) NOT NULL,
  `phone1` varchar(20) NOT NULL,
  `phone2` varchar(20) DEFAULT NULL,
  `localAddress` text,
  `permanentAddress` text,
  `U_S_ID` varchar(20) DEFAULT NULL,
  `password` varchar(250) NOT NULL,
  `roleId` int NOT NULL DEFAULT '2',
  `isActive` enum('A','I') DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Email` (`email`),
  UNIQUE KEY `Phone1` (`phone1`),
  KEY `User_Name_ASC` (`name`),
  KEY `roleId` (`roleId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Anurag Kumar','05-03-1996','M','anurag.dev443@gmail.com','+91-7988097590',NULL,'Near Jehan Circle,\n Nashik, Maharashtra-4220053','Near Jehan Circle,\n Nashik, Maharashtra-4220053',NULL,'$2b$10$GLovkCRGtJTdRi30burdZO/R8cvLMQ49ysQYHGJqpBgrXNbEfSKoW',1,'A','2023-04-16 13:38:54','2023-04-16 13:38:54'),(2,'Rahul Gandhi','11-12-1986','M','rahul.gandhi@gmail.com','+91-7988097591',NULL,'1 Akbar Road New Dehi, India-110001','1 Akbar Road New Dehi, India-110001','ST-1682050031724','$2b$10$HCvkmNew3ArdufRQ8b9F4u1n09Xf7uYGxKTVWtWqOm6zzWc.JDUjm',2,'A','2023-04-21 04:07:11','2023-04-21 04:07:11'),(3,'Mallikarjun Khadge','10-11-1976','M','m.khadge@gmail.com','+91-7988097592',NULL,'2 Akbar Road New Dehi, India-110001','2 Akbar Road New Dehi, India-110001','ST-1682050160331','$2b$10$QfP8N2rN6JZiMHr6qqS2nenfpb2Ef9MG.o2ncaxAHpvlP/o2c.Hye',2,'A','2023-04-21 04:09:20','2023-04-21 04:09:20'),(4,'Sonia Gandhi','10-11-1966','F','sonia.g@gmail.com','+91-7988097593',NULL,'1 Akbar Road New Dehi, India-110001','1 Akbar Road New Dehi, India-110001','ST-1682050215748','$2b$10$DxR9BTlCfr46ci245CoEd.AV8//IS2CKskkoz5ydZT38rf.aqOjDG',2,'A','2023-04-21 04:10:15','2023-04-21 04:10:15'),(5,'Sachin Pilot','01-03-1990','M','sachin.pilotg@gmail.com','+91-7988097594',NULL,'12 New Capital Road Jaipur, Rajsthan-303329','12 New Capital Road Jaipur, Rajsthan-303329','ST-1682050347366','$2b$10$2jZg.MrFSZ7IZf9OznsY7eCSDKbnN510UkwnV77bHwumGgBOLVVUu',2,'I','2023-04-21 04:12:27','2023-09-06 14:07:50'),(6,'Arvind Kejriwal','05-03-1980','M','arvind.k@gmail.com','+91-7988097595',NULL,'1 New Koushambi villa New Delhi NCT, Delhi-110002','1 New Koushambi villa New Delhi NCT, Delhi-110002',NULL,'$2b$10$YrUIQgNtiVhJOCm4gW0Ybe3Mhl7l/wewtHxGMYBXpGxY8n7ZZMtNS',3,'A','2023-04-21 04:21:13','2023-04-21 04:21:13'),(7,'Manish Sishodia','05-03-1980','M','manish.s@gmail.com','+91-7988097596',NULL,'2 New Koushambi villa New Delhi NCT, Delhi-110002','2 New Koushambi villa New Delhi NCT, Delhi-110002',NULL,'$2b$10$B/brnqZdja2g2JgpETCdB.ik9p8yN.6dEDoloLBMo3QZ091M3CHpy',3,'A','2023-04-21 04:21:49','2023-04-21 04:21:49'),(8,'Akhilesh Yadav','05-03-1986','M','akhilesh.y@gmail.com','+91-7988097597',NULL,'3 Mainpuri Uttar Pradesh, UP-230001','3 Mainpuri Uttar Pradesh, UP-230001',NULL,'$2b$10$z/PSZUrX7y.y.kruwTKRq.rskCvK1tdJlwSoceVKljM/dE.Em0uNa',3,'A','2023-04-21 04:24:08','2023-04-21 04:24:08'),(9,'Amit Shah','02-03-1986','M','amith.shah@gmail.com','+91-7988097599',NULL,'2 Lok Klayan Marg New Delhi, India-110001','2 Lok Klayan Marg New Delhi, India-110001',NULL,'$2b$10$TSEFBd/R/p5AAh3ax7cPzeG3Ex9snfihpL40vkAy2Aurauu9yCHTa',4,'A','2023-04-21 04:26:20','2023-04-21 04:26:20'),(10,'Rajnath Singh','02-03-1976','M','rajnath.singh@gmail.com','+91-7988097598',NULL,'3 Lok Klayan Marg New Delhi, India-110001','3 Lok Klayan Marg New Delhi, India-110001',NULL,'$2b$10$99rlJwCNFYSoKnVbArkUleiHyINF3Grx/El3VkdmqR90dkxRhj/8G',4,'A','2023-04-21 04:27:16','2023-04-21 04:27:16'),(11,'Nitin Gadkari','01-03-1980','M','nitin.g@gmail.com','+91-8988097598',NULL,'4 Lok Klayan Marg New Delhi, India-110001','4 Lok Klayan Marg New Delhi, India-110001',NULL,'$2b$10$Djlb76YHUl6aFAdtE7p4guy0NZlo2Mp3fI/yxWmmLcsMYSeriMl.e',4,'A','2023-04-21 04:28:07','2023-04-21 04:28:07'),(12,'Mandar Jambotkar','03-03-1986','M','mj5@gmail.com','+91-9664000535',NULL,'Nashik Road, Nashik, Maharashtra-4220053','Nashik Road, Nashik, Maharashtra-4220053','EMP-16919245092','$2b$10$MqtkrwTy3ZWF2tgSLUeneeyfP3hKG0fQCrv.esfMB8cpHwJ4lUuhC',4,'A','2023-08-13 11:01:49','2023-08-13 11:01:49'),(13,'Sonu Nigam','01-03-1986','M','sonu.nigam@gmail.com','+91-9664000537',NULL,'Kurla Bandra complex, Mumbai, Maharashtra-400012','Kurla Bandra complex, Mumbai, Maharashtra-400012','EMP-16919249932','$2b$10$hoKc/jd0vEAXOlEtPkAHpuTZZghgaFGr2gnuJebYnTv9XDAEf74eS',4,'A','2023-08-13 11:09:53','2023-08-13 11:09:53'),(14,'Shreya Deliwala','01-03-1996','F','shreya.d@gmail.com','+91-9664000539',NULL,'Kurla Bandra complex, Mumbai, Maharashtra-400012','Kurla Bandra complex, Mumbai, Maharashtra-400012','EMP-16919267510','$2b$10$4wgR5v8nITLc1dleYX0Ku.PTHSJjWc3IC8wqU4r3vO.B6wfMB6VM2',4,'A','2023-08-13 11:39:11','2023-08-13 11:39:11'),(15,'Radhe Shyam','25-08-1993','M','radhe.shyam@gmail.com','9876543210','9876543210','Jalgaon, Maharashtra','Jalgaon, Maharashtra','EMP-16930346016','$2b$10$UlmhSRIhNXLrcyNxzhGVNeKAVr5WTqN8gQ2XyvUyiOaZbewPlf3Ga',4,'A','2023-08-26 07:23:21','2023-08-26 07:23:21'),(16,'Nikhil Bagri','18-02-2000','M','nikhil.bagri@gmail.com','9876543211','9876543212','Kota Rajsthan','Kota Rajsthan','EMP-16930351219','$2b$10$0Or5M4FOr6MlJnUcCuV9s.3SMQY43/v003qCml26xkvnkn.DialrG',4,'A','2023-08-26 07:32:01','2023-08-26 07:32:01'),(17,'Ram Shinde','20-02-2000','M','shivamp@mail.com','+91-8282828292','','Nashik','Maharashtra','ST-16940113990','$2b$10$PiQ.B3XAMA2yNyqhsNHNtObsMEUxB7EnEe0NRZT..cmJ1RhkkkRTe',2,'A','2023-09-06 14:43:19','2023-09-06 14:43:19'),(18,'John Doe','2018-08-08','M','john.doe@gmail.com','9812312312','9812312312','New Delhi','New Delhi','ST-16941840088','$2b$10$sWElwaDgUSuz7KPtYaUai.HOghcigNVdNEQUClbvxEQhoG5vKRRce',2,'A','2023-09-08 14:40:08','2023-09-08 14:40:08'),(19,'Jane Doe','2015-06-10','F','jane.doe@gmail.com','8989989898','8989989898','Shivaji Nagar Pune','Shivaji Nagar Pune','ST-16941843840','$2b$10$WUtuJofHzrd1pwBmDtYJZe/QUMYQ.nZAufOP.U7seM0.zxDn2nRDe',2,'A','2023-09-08 14:46:24','2023-09-08 14:46:24'),(20,'Lily Traversy','1987-07-07','F','lily.t@gmail.com','7899876541','7899876541','San Francisco','San Francisco','ST-16941883532','$2b$10$lI2EuWp8CRkyBiNx6rRS3OSRqztqpsJXo0Ev/ueZCfE3wCXy1s2BG',2,'A','2023-09-08 15:52:33','2023-09-08 15:52:33');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-10 20:38:25
