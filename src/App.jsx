// App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MovieDetails from './pages/MovieDetails.jsx';
import Booking from './pages/Booking.jsx';
import Payment from './pages/Payment.jsx';
import Profile from './pages/Profile.jsx';
import Header from './components/Header.jsx';
import './styles/index.css';
import axios from 'axios';
import { setupAxiosInterceptors } from './services/auth.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { inactivityDetector } from './utils/inactivityDetector.js';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

const App = () => {
  useEffect(() => {
    setupAxiosInterceptors(axios);

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, start inactivity detection
        inactivityDetector.setupActivityListeners();
      } else {
        // User is signed out, cleanup inactivity detection
        inactivityDetector.cleanup();
      }
    });

    // Cleanup on component unmount
    return () => {
      unsubscribe();
      inactivityDetector.cleanup();
    };
  }, []);

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Header />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/booking/:showingId" element={<Booking />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment/:transactionId" element={<Payment />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;