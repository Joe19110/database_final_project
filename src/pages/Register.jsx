import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';
import '../styles/Auth.css';
import { setToken } from '../services/auth';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Register user in backend with Firebase UID, name, email
      const response = await axios.post('http://localhost:5000/api/customers', {
        customer_name: name,
        customer_email: email,
        firebase_uid: user.uid,
      });

      // Store the JWT token
      if (response.data.token) {
        setToken(response.data.token);
        navigate('/');
      }
    } catch (err) {
      console.error("Registration Error:", err);
      // Handle specific Firebase errors or backend errors
      if (err.code === 'auth/email-already-in-use') {
        setError('The email address is already in use by another account.');
      } else if (err.response && err.response.data && err.response.data.error) {
         setError(`Registration failed: ${err.response.data.error}`);
      }
      else {
        setError('Failed to register. Please try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Name"
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="auth-button popping-login-btn">
            Sign Up
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <span className="switch-link" onClick={() => navigate('/login')}>Login</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
