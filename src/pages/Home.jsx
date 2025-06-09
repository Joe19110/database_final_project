import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
// import MovieCard from '../components/MovieCard.jsx'; // Uncomment if you use a separate MovieCard component

const placeholderImage = '/assets/placeholder.jpg';

const MovieCard = ({ movie }) => (
  <div className="movie-card">
    <Link to={`/movie/${movie.movie_id}`}>
      <img
        src={movie.poster_url || placeholderImage}
        onError={(e) => (e.target.src = placeholderImage)}
        alt={movie.movie_title}
        className="movie-poster"
      />
    </Link>
    <div className="movie-info">
      <h3 className="movie-title">{movie.movie_title}</h3>
    </div>
  </div>
);

const Home = () => {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/movies')
      .then(response => {
        const today = new Date();
        const nowShowingMovies = response.data.filter(movie => 
          new Date(movie.release_date) <= today
        );
        const comingSoonMovies = response.data.filter(movie => 
          new Date(movie.release_date) > today
        );

        setNowShowing(nowShowingMovies);
        setComingSoon(comingSoonMovies);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const MovieRow = ({ movies, title, emptyMessage }) => (
    <div className="mb-10">
      <h2 className="movie-row-title">{title}</h2>
      <div className="movie-row-container">
        {movies.length > 0 ? (
          <div className="movie-row">
            {movies.map(movie => (
              <MovieCard movie={movie} key={movie.movie_id} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">{emptyMessage}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="home-container">
      <div className="content-wrapper">
        <MovieRow 
          movies={nowShowing} 
          title="🎬 Now Showing" 
          emptyMessage="No movies currently showing."
        />
        <MovieRow 
          movies={comingSoon} 
          title="🎞️ Coming Soon" 
          emptyMessage="No upcoming movies yet."
        />
      </div>
    </div>
  );
};

export default Home;