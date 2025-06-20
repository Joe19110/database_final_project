/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `age_ratings` (
  `age_rating_id` int NOT NULL AUTO_INCREMENT,
  `age_rating_name` varchar(50) NOT NULL,
  PRIMARY KEY (`age_rating_id`),
  UNIQUE KEY `age_rating` (`age_rating_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `customer_password` varchar(255) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone_number` varchar(15) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `customer_email` (`customer_email`),
  UNIQUE KEY `phone_number` (`customer_phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genres` (
  `genre_id` int NOT NULL AUTO_INCREMENT,
  `genre_name` varchar(50) NOT NULL,
  PRIMARY KEY (`genre_id`),
  UNIQUE KEY `genre_name` (`genre_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movies` (
  `movie_id` int NOT NULL AUTO_INCREMENT,
  `movie_title` varchar(255) NOT NULL,
  `movie_duration` time DEFAULT NULL,
  `movie_description` text,
  `genre_id` int DEFAULT NULL,
  `poster_url` varchar(255) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `age_rating_id` int DEFAULT NULL,
  PRIMARY KEY (`movie_id`),
  KEY `genre_id` (`genre_id`),
  KEY `age_rating_id` (`age_rating_id`),
  CONSTRAINT `movies_ibfk_1` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`genre_id`),
  CONSTRAINT `movies_ibfk_2` FOREIGN KEY (`age_rating_id`) REFERENCES `age_ratings` (`age_rating_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_method_types` (
  `type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  PRIMARY KEY (`type_id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `payment_method_id` int NOT NULL AUTO_INCREMENT,
  `payment_method_name` varchar(50) NOT NULL,
  `payment_method_type_id` int DEFAULT NULL,
  `handling_fee` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`payment_method_id`),
  UNIQUE KEY `payment_method_name` (`payment_method_name`),
  KEY `payment_method_type_id` (`payment_method_type_id`),
  CONSTRAINT `payment_methods_ibfk_1` FOREIGN KEY (`payment_method_type_id`) REFERENCES `payment_method_types` (`type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seat_bookings` (
  `transaction_id` int DEFAULT NULL,
  `showing_id` int DEFAULT NULL,
  `seat_row` char(1) DEFAULT NULL,
  `seat_column` int DEFAULT NULL,
  `status` varchar(10) NOT NULL DEFAULT 'available',
  KEY `transaction_id` (`transaction_id`),
  KEY `showing_id` (`showing_id`),
  CONSTRAINT `seat_bookings_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`transaction_id`),
  CONSTRAINT `seat_bookings_ibfk_2` FOREIGN KEY (`showing_id`) REFERENCES `showings` (`showing_id`),
  CONSTRAINT `seat_bookings_chk_1` CHECK ((`status` in (_utf8mb4'booked',_utf8mb4'pending',_utf8mb4'available')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `showings` (
  `showing_id` int NOT NULL AUTO_INCREMENT,
  `theater_id` int DEFAULT NULL,
  `movie_id` int DEFAULT NULL,
  `showing_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  PRIMARY KEY (`showing_id`),
  KEY `hall_id` (`theater_id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `showings_ibfk_1` FOREIGN KEY (`theater_id`) REFERENCES `theaters` (`theater_id`),
  CONSTRAINT `showings_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `theater_types` (
  `theater_type_name` varchar(50) DEFAULT NULL,
  `weekday_ticket_price` decimal(10,2) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `theater_type_id` int NOT NULL AUTO_INCREMENT,
  `weekend_ticket_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`theater_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `theaters` (
  `theater_id` int NOT NULL AUTO_INCREMENT,
  `theater_name` varchar(50) DEFAULT NULL,
  `num_rows` int DEFAULT NULL,
  `num_columns` int DEFAULT NULL,
  `theater_type_id` int DEFAULT NULL,
  PRIMARY KEY (`theater_id`),
  UNIQUE KEY `hall_name` (`theater_name`),
  KEY `fk_hall_type` (`theater_type_id`),
  CONSTRAINT `fk_hall_type` FOREIGN KEY (`theater_type_id`) REFERENCES `theater_types` (`theater_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(128) DEFAULT NULL,
  `showing_id` int DEFAULT NULL,
  `status` enum('pending','paid','cancelled') DEFAULT 'pending',
  `expiry_time` datetime DEFAULT NULL,
  `payment_method_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `customer_id` (`customer_id`),
  KEY `showing_id` (`showing_id`),
  KEY `fk_payment_method` (`payment_method_id`),
  CONSTRAINT `fk_payment_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`payment_method_id`),
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`showing_id`) REFERENCES `showings` (`showing_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Insert some default payment method types
INSERT INTO payment_method_types (type_name) VALUES
    ('Credit/Debit Card'),
    ('Digital Wallet'),
    ('Bank Transfer');

-- Update payment_methods table to reference payment_method_types
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS payment_method_type_id INTEGER REFERENCES payment_method_types(type_id);

-- Update existing payment methods with their types
UPDATE payment_methods
SET payment_method_type_id = (
    CASE 
        WHEN payment_method_name IN ('Visa', 'Mastercard', 'American Express') THEN 
            (SELECT type_id FROM payment_method_types WHERE type_name = 'Credit/Debit Card')
        WHEN payment_method_name IN ('PayPal', 'Google Pay', 'Apple Pay') THEN 
            (SELECT type_id FROM payment_method_types WHERE type_name = 'Digital Wallet')
        WHEN payment_method_name IN ('Direct Deposit', 'Wire Transfer') THEN 
            (SELECT type_id FROM payment_method_types WHERE type_name = 'Bank Transfer')
    END
);

-- Make payment_method_type_id NOT NULL after updating existing records
ALTER TABLE payment_methods
ALTER COLUMN payment_method_type_id SET NOT NULL;
