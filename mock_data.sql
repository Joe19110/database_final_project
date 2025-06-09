SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM showings;
DELETE FROM movies;
DELETE FROM theaters;
DELETE FROM theater_types;
DELETE FROM genres;
DELETE FROM age_ratings;

-- Insert mock data for dependencies first
INSERT INTO genres (genre_id, genre_name) VALUES
(1, 'Action'),
(2, 'Sci-Fi'),
(3, 'Comedy'),
(4, 'Drama'),
(5, 'Horror'),
(6, 'Adventure'),
(7, 'Animation'),
(8, 'Thriller'),
(9, 'Fantasy'),
(10, 'Romance');

INSERT INTO age_ratings (age_rating_id, age_rating_name) VALUES
(1, 'G'),
(2, 'PG'),
(3, 'PG-13'),
(4, 'R');

-- Using corrected columns based on schema and previous attempts
INSERT INTO theater_types (theater_type_id, theater_type_name, weekday_ticket_price, weekend_ticket_price, description) VALUES
(1, 'Regular', 50000, 75000, 'Standard seating and screen.'),
(2, 'Deluxe', 65000, 90000, 'Premium seating with added comfort.'),
(3, 'IMAX', 80000, 110000, 'Large format screen and sound.'),
(4, '3D', 55000, 80000, '3D projection capability.');

-- Using corrected columns based on schema
INSERT INTO theaters (theater_id, theater_type_id, theater_name, num_rows, num_columns) VALUES
(1, 1, 'Theater 1', 10, 15),
(2, 2, 'Theater 2 (Deluxe)', 8, 12),
(3, 3, 'Theater 3 (IMAX)', 12, 10),
(4, 4, 'Theater 4 (3D)', 10, 15);

-- Current Movies (Now Showing)
INSERT INTO movies (movie_id, genre_id, age_rating_id, movie_title, movie_description, movie_duration, poster_url, release_date, status) VALUES
(1, 1, 3, 'The Last Stand', 'An elite special forces team faces their toughest mission yet in this high-stakes action thriller.', '02:15:00', '/src/assets/placeholder.svg', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'active'),
(2, 7, 2, 'Ocean Dreams', 'A magical underwater adventure that follows a young mermaid quest to save her kingdom.', '01:52:00', '/src/assets/placeholder.svg', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'active'),
(3, 4, 4, 'Midnight Symphony', 'A struggling musician finds inspiration in the most unexpected places of New York City.', '02:08:00', '/src/assets/placeholder.svg', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'active'),
(4, 8, 3, 'Digital Horizon', 'When virtual reality meets consciousness, the line between real and digital blurs.', '02:22:00', '/src/assets/placeholder.svg', DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'active'),
(5, 3, 2, 'Family Chaos', 'A heartwarming comedy about a family reunion that goes hilariously wrong.', '01:45:00', '/src/assets/placeholder.svg', DATE_SUB(CURDATE(), INTERVAL 12 DAY), 'active'),
(6, 5, 4, 'Whispers in the Dark', 'A paranormal investigator confronts her own past while solving her latest case.', '01:58:00', '/src/assets/placeholder.svg', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'active'),
(7, 9, 3, 'Crystal Kingdom', 'In a world where magic is fading, one young sorceress must restore balance.', '02:35:00', '/src/assets/placeholder.svg', DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'active');

-- Coming Soon Movies
INSERT INTO movies (movie_id, genre_id, age_rating_id, movie_title, movie_description, movie_duration, poster_url, release_date, status) VALUES
(8, 2, 3, 'Beyond the Stars', 'Humanitys first interstellar mission discovers more than they bargained for.', '02:28:00', '/src/assets/placeholder.svg', DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'active'),
(9, 6, 2, 'Lost City of Gold', 'An archaeologists quest leads to the discovery of a legendary ancient city.', '02:12:00', '/src/assets/placeholder.svg', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'active'),
(10, 10, 3, 'Summer in Paris', 'A chance encounter in the City of Love leads to an unforgettable romance.', '02:00:00', '/src/assets/placeholder.svg', DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'active'),
(11, 1, 3, 'Speed Force', 'When time starts running backwards, one man must race against the clock to save humanity.', '02:18:00', '/src/assets/placeholder.svg', DATE_ADD(CURDATE(), INTERVAL 25 DAY), 'active'),
(12, 7, 1, 'Robot Friends', 'A heartwarming animated tale about a lonely robot who learns the meaning of friendship.', '01:35:00', '/src/assets/placeholder.svg', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'active'),
(13, 8, 4, 'The Mind Reader', 'A detective with psychic abilities must stop a killer who shares the same gift.', '02:05:00', '/src/assets/placeholder.svg', DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'active'),
(14, 4, 3, 'Canvas of Life', 'A talented artist loses her sight but discovers a new way to see the world.', '02:02:00', '/src/assets/placeholder.svg', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 'active');

-- Generate showings for current movies (multiple showings per movie)
INSERT INTO showings (showing_id, movie_id, theater_id, showing_date, start_time) VALUES
-- Today's showings
(1, 1, 3, CURDATE(), '10:00:00'),
(2, 1, 3, CURDATE(), '14:30:00'),
(3, 2, 1, CURDATE(), '11:00:00'),
(4, 2, 4, CURDATE(), '15:00:00'),
(5, 3, 2, CURDATE(), '13:00:00'),
(6, 3, 2, CURDATE(), '18:30:00'),
(7, 4, 1, CURDATE(), '16:00:00'),
(8, 5, 4, CURDATE(), '12:00:00'),
(9, 6, 2, CURDATE(), '20:00:00'),
(10, 7, 3, CURDATE(), '17:30:00'),

-- Tomorrow's showings
(11, 1, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:30:00'),
(12, 2, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00'),
(13, 3, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:30:00'),
(14, 4, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:00:00'),
(15, 5, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00:00'),
(16, 6, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:30:00'),
(17, 7, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:00:00'),

-- Day after tomorrow's showings
(18, 1, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '12:00:00'),
(19, 2, 4, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '16:00:00'),
(20, 3, 2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:30:00'),
(21, 4, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '17:30:00'),
(22, 5, 4, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '13:00:00'),
(23, 6, 2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:30:00'),
(24, 7, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:00:00');

SET FOREIGN_KEY_CHECKS = 1;