SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM showings;
DELETE FROM movies;
DELETE FROM theaters;
DELETE FROM theater_types;
DELETE FROM genres;
DELETE FROM age_ratings;

INSERT INTO genres (genre_id, genre_name) VALUES
(1, 'Action'),
(2, 'Sci-Fi'),
(3, 'Comedy');

INSERT INTO age_ratings (age_rating_id, age_rating_name) VALUES
(1, 'G'),
(2, 'PG');

INSERT INTO movies (movie_id, genre_id, age_rating_id, movie_title, movie_description, movie_duration, poster_url, release_date, status) VALUES
(1, 1, 2, 'Test Movie', 'Test Description', '02:00:00', '/test.jpg', CURDATE(), 'active');

SET FOREIGN_KEY_CHECKS = 1; 