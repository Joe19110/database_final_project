import React, { useEffect, useState } from 'react';
import axios from 'axios';
// Remove useParams import
// import { useParams } from 'react-router-dom';
// Keep Firebase auth imports
import {
  getAuth, onAuthStateChanged, signOut
} from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/Profile.css'; // Keep the CSS import
// Import useNavigate for redirection
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../services/auth';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/formatCurrency';

const Profile = () => {
  // Remove useParams hook
  // const { id } = useParams(); // Get ID from URL parameters
  const [customer, setCustomer] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]); // Renamed from 'history' for clarity with backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null); // State to hold the Firebase User object
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
    customer_name: '',
    customer_phone_number: ''
  });
  const [activeTab, setActiveTab] = useState('ongoing');
  const [ongoingTransactions, setOngoingTransactions] = useState([]);
  const [completedTransactions, setCompletedTransactions] = useState([]);

  const navigate = useNavigate();

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

  useEffect(() => {
    // Use onAuthStateChanged to get the authenticated user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user); // Set the Firebase user object
      setLoading(false); // Stop initial loading state after auth check
       if (!user) {
         // If user logs out while on the profile page
          setCustomer(null);
          setPurchaseHistory([]);
          setError('User not logged in.');
       }
    });

    // Clean up the subscription
    return () => unsubscribe();
  }, [navigate]); // Empty dependency array means this runs once on mount


  useEffect(() => {
    const fetchProfileData = async () => {
      if (!firebaseUser) return;

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5000/api/customers/${firebaseUser.uid}/history`);
        setCustomer(response.data.customer);
        
        // Filter transactions into ongoing and completed
        const allTransactions = response.data.history || [];
        setOngoingTransactions(allTransactions.filter(t => 
          t.status === 'pending' && new Date(t.expiry_time) > new Date()
        ));
        setCompletedTransactions(allTransactions.filter(t => 
          t.status !== 'pending' || new Date(t.expiry_time) <= new Date()
        ));
        
        setEditedDetails({
          customer_name: response.data.customer.customer_name,
          customer_phone_number: response.data.customer.customer_phone_number || ''
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data.');
        setLoading(false);
      }
    };
    fetchProfileData();

    // Set up interval to refresh data every minute
    const intervalId = setInterval(fetchProfileData, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [firebaseUser]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original values
      setEditedDetails({
        customer_name: customer.customer_name,
        customer_phone_number: customer.customer_phone_number || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePhoneNumber = (phone) => {
    // Basic Indonesian phone number validation
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return phone === '' || phoneRegex.test(phone);
  };

  const handleSave = async () => {
    if (!editedDetails.customer_name.trim()) {
      toast.error('Name cannot be empty', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!validatePhoneNumber(editedDetails.customer_phone_number)) {
      toast.error('Please enter a valid Indonesian phone number', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/customers/${firebaseUser.uid}`, {
        customer_name: editedDetails.customer_name,
        customer_phone_number: editedDetails.customer_phone_number
      });

      setCustomer(prev => ({
        ...prev,
        customer_name: editedDetails.customer_name,
        customer_phone_number: editedDetails.customer_phone_number
      }));

      setIsEditing(false);
      toast.success('Profile updated successfully!', {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.error || 'Failed to update profile', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const renderTransactionCard = (transaction) => {
    const isExpired = transaction.expiry_time && new Date(transaction.expiry_time) <= new Date();
    const displayStatus = transaction.status === 'pending' && isExpired ? 'cancelled' : transaction.status;

    return (
    <div key={transaction.transaction_id} className="transaction-card">
      <h4>Transaction ID: {transaction.transaction_id}</h4>
      <p><strong>Date:</strong> {new Date(transaction.created_at).toLocaleDateString('en-GB')}</p>
      <p><strong>Total:</strong> {formatCurrency(transaction.total_amount)}</p>
      <p><strong>Status:</strong> {displayStatus}</p>
      <p><strong>Payment Method:</strong> {transaction.payment_method_name || 'Not selected'}</p>
      {transaction.status === 'pending' && !isExpired && (
        <button
          className="rect-auth-btn"
          style={{ margin: '10px 0', height: '48px', minWidth: '160px', width: 'fit-content', fontSize: '0.9rem', padding: '0 20px' }}
          onClick={() => navigate(`/payment/${transaction.transaction_id}`)}
        >
          Complete Payment
        </button>
      )}
      {transaction.expiry_time && !isExpired && (
        <p><strong>Expires:</strong> {new Date(transaction.expiry_time).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      )}
      <h4>Showings:</h4>
      <div className="showings-list">
        <div className="showing-item">
          <img src={transaction.poster_url || '/placeholder.jpg'} alt={transaction.movie_title || 'Movie Poster'} />
          <div>
            <p><strong>Movie:</strong> {transaction.movie_title || 'N/A'}</p>
            <p><strong>Date:</strong> {transaction.showing_date ? new Date(transaction.showing_date).toLocaleDateString('en-GB') : 'N/A'}</p>
            <p><strong>Time:</strong> {transaction.start_time ? transaction.start_time.substring(0, 5) : 'N/A'}</p>
            <p><strong>Theater:</strong> {transaction.theater_name || 'N/A'}</p>
            <p><strong>Seats:</strong> {transaction.seats || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  )};

  // Render loading state while fetching user auth status initially
  if (loading && firebaseUser === null) {
    return <div className="profile-container">Checking authentication status...</div>;
  }

  // Render error state if no firebase user is logged in
  if (!firebaseUser) {
      return (
        <div className="profile-container">
          <h2>Access Denied</h2>
          <p>Please log in to view your profile.</p>
          {error && <p className="error-message">{error}</p>} {/* Display specific error if any */}
        </div>
      );
  }

  // Render loading state while fetching profile data after user is confirmed
  if (loading) {
    return <div className="profile-container">Loading profile...</div>;
  }

   if (error) {
    return (
      <div className="profile-container">
        <h2>Error Loading Profile</h2>
        <p>{error}</p> {/* Display the specific error message */}
      </div>
    );
  }

  // If user is logged in, not loading, and no error, render profile content
  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      
      <div className="profile-details">
        {customer && (
          <div className="user-info">
            <div className="info-row">
              <label>Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="customer_name"
                  value={editedDetails.customer_name}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <span>{customer.customer_name}</span>
              )}
            </div>

            <div className="info-row">
              <label>Email:</label>
              <span>{customer.customer_email}</span>
            </div>

            <div className="info-row">
              <label>Phone:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="customer_phone_number"
                  value={editedDetails.customer_phone_number}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="edit-input"
                />
              ) : (
                <span>{customer.customer_phone_number || 'Not set'}</span>
              )}
            </div>

            <div className="edit-buttons">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="save-btn">Save</button>
                  <button onClick={handleEditToggle} className="cancel-btn">Cancel</button>
                </>
              ) : (
                <button onClick={handleEditToggle} className="edit-btn">Edit Profile</button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="purchase-history-container">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'ongoing' ? 'active' : ''}`}
            onClick={() => setActiveTab('ongoing')}
          >
            Ongoing ({ongoingTransactions.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History ({completedTransactions.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'ongoing' && (
            <div className="purchase-history">
              {ongoingTransactions.length > 0 ? (
                ongoingTransactions.map(renderTransactionCard)
              ) : (
                <p className="no-transactions">No ongoing transactions</p>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="purchase-history">
              {completedTransactions.length > 0 ? (
                completedTransactions.map(renderTransactionCard)
              ) : (
                <p className="no-transactions">No transaction history</p>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Profile; 