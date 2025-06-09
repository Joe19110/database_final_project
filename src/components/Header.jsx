import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css'; // We will create this next
import { auth } from '../firebase'; // Import auth instance
import { signOut, onAuthStateChanged } from 'firebase/auth'; // Import auth functions
import { removeToken } from '../services/auth';
import { toast } from 'react-toastify';

const Header = () => {
  const [user, setUser] = useState(null); // State to hold authenticated user
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update state with the current user
      setAuthChecked(true);
      console.log('Header Auth state changed:', currentUser);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []); // Effect runs only once on mount

  const handleLogout = async () => {
    try {
      await signOut(auth);
      removeToken(); // Remove JWT token
      toast.success('Successfully logged out!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error logging out. Please try again.', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  console.log('Header user:', user, 'authChecked:', authChecked);

  return (
    <header className="app-header">
      <div className="header-flex">
        <div className="cinema-name"><Link to="/"><span className="cinema-emoji">🍿</span>CinemaX</Link></div>
        <nav>
          <ul className="nav-right">
            {!authChecked ? null : user ? (
              <>
                <li><Link to="/profile" className="rect-auth-btn">Profile</Link></li>
                <li><button onClick={handleLogout} className="rect-auth-btn">Logout</button></li>
              </>
            ) : (
              <li><Link to="/login" className="rect-auth-btn">Login</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 