import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import '../styles/MovieDetails.css';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [allShowings, setAllShowings] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [next7Days, setNext7Days] = useState([]);
  const [isComingSoon, setIsComingSoon] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/movies/${id}`)
      .then(response => {
        const { movie, showings } = response.data;
        const movieData = Array.isArray(movie) ? movie[0] : movie;
        setMovie(movieData);

        // Get today's date at the start of the day in local timezone
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if movie is coming soon
        const releaseDate = new Date(movieData.release_date);
        releaseDate.setHours(0, 0, 0, 0);
        setIsComingSoon(releaseDate > today);

        // Process showings to ensure dates are properly formatted
        const processedShowings = showings.map(showing => ({
          ...showing,
          showing_date: new Date(showing.showing_date).toISOString().split('T')[0]
        }));
        
        setAllShowings(processedShowings || []);

        // Calculate next 7 days starting from today
        const days = [];
        const now = new Date();
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          days.push(dateStr);
        }
        
        setNext7Days(days);
        setSelectedDate(days[0]);
      })
      .catch(error => console.error(error));
  }, [id]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const findNextAvailableDate = () => {
    const nextAvailableDate = next7Days.find(date => 
      allShowings.some(s => s.showing_date === date)
    );
    if (nextAvailableDate) setSelectedDate(nextAvailableDate);
  };

  if (!movie) {
    return (
      <div className="loading-screen">
        <p>Loading movie details...</p>
      </div>
    );
  }

  return (
    <div className="movie-details-page">
      <div className="movie-content-container">
        
        {/* Movie Poster, Title and Description */}
        <div className="movie-header">
          <img
            src={movie.poster_url || '/placeholder.jpg'}
            alt={movie.movie_title}
            className="movie-poster"
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
            }}
          />
          <h1 className="movie-title">{movie.movie_title}</h1>
          <div className="movie-metadata">
            {movie.genre_name && (
              <span className="movie-genre">{movie.genre_name}</span>
            )}
            {movie.age_rating_name && movie.genre_name && (
              <span className="metadata-separator">•</span>
            )}
            {movie.age_rating_name && (
              <span className="movie-rating">{movie.age_rating_name}</span>
            )}
            {movie.movie_duration && movie.age_rating_name && (
              <span className="metadata-separator">•</span>
            )}
            {movie.movie_duration && Number.isInteger(movie.movie_duration) && (
              <span className="movie-duration">
                {`${Math.floor(movie.movie_duration / 60)}h ${movie.movie_duration % 60}m`}
              </span>
            )}
          </div>
          <p className="movie-description">
            {movie.movie_description || 'No description available.'}
          </p>
        </div>

        {/* Date Selection and Showings Section */}
        {isComingSoon ? (
          <div className="coming-soon-section">
            <h2 className="section-title">Coming Soon</h2>
            <div className="coming-soon-message">
              <p>This movie will be released on {new Date(movie.release_date).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p>Check back later for available showtimes!</p>
            </div>
          </div>
        ) : (
          <>
            {/* Date Selection */}
            <div className="date-selection-section">
              <h2 className="section-title">Choose a Date</h2>
              <div className="date-buttons-container">
                {next7Days.map(date => {
                  const hasShowings = allShowings.some(s => s.showing_date === date);
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`date-button ${selectedDate === date ? 'active' : ''} ${hasShowings ? 'has-showings' : ''}`}
                    >
                      {formatDate(date)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Showtimes */}
            <div className="showtimes-section">
              <h2 className="section-title">
                Showtimes for {formatDate(selectedDate)}
              </h2>
              
              {allShowings.some(s => s.showing_date === selectedDate) ? (
                <div className="showtimes-grid">
                  {allShowings
                    .filter(s => s.showing_date === selectedDate)
                    .map(showing => (
                      <Link 
                        to={`/booking/${showing.showing_id}`} 
                        key={showing.showing_id}
                        className="showtime-link"
                      >
                        <div className="showtime-card">
                          <span className="showtime">
                            {new Date(`2000-01-01T${showing.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="hall-name">{showing.theater_name || 'Standard Theater'}</span>
                        </div>
                      </Link>
                    ))}
                </div>
              ) : (
                <div className="no-showtimes-message">
                  <p>No showtimes scheduled for this date</p>
                  <button 
                    className="check-availability-button"
                    onClick={findNextAvailableDate}
                  >
                    Check next available date
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MovieDetails;