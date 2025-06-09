import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Payment.css';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/formatCurrency';

const Payment = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const [transactionDetails, setTransactionDetails] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodTypes, setPaymentMethodTypes] = useState([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMethod, setExpandedMethod] = useState(null);

  // Group payment methods by their type_id
  const groupPaymentMethodsByType = (methods, types) => {
    const groupedMethods = {};
    
    // Initialize groups for each type
    types.forEach(type => {
      groupedMethods[type.payment_method_type_id] = {
        typeName: type.payment_method_type_name,
        methods: []
      };
    });

    // Group methods by their type_id
    methods.forEach(method => {
      if (groupedMethods[method.payment_method_type_id]) {
        groupedMethods[method.payment_method_type_id].methods.push(method);
      }
    });

    return groupedMethods;
  };

  console.log('Payment component rendered');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch transaction details
        const transactionRes = await axios.get(`http://localhost:5000/api/transactions/${transactionId}`);
        setTransactionDetails(transactionRes.data);
        console.log('Fetched transaction details:', transactionRes.data);

        // Fetch payment method types first
        const typesRes = await axios.get('http://localhost:5000/api/payment_method_types');
        setPaymentMethodTypes(typesRes.data);
        console.log('Fetched payment method types:', typesRes.data);

        // Then fetch available payment methods
        const methodsRes = await axios.get('http://localhost:5000/api/payment_methods');
        setPaymentMethods(methodsRes.data);
        console.log('Fetched payment methods:', methodsRes.data);

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching payment data:', err);
        setError('Failed to load payment data. Please try again later.');
        setIsLoading(false);
      }
    };

    if (transactionId) {
      fetchData();
    } else {
      setError('Invalid transaction ID.');
      setIsLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    console.log('PaymentMethods state updated:', paymentMethods);
  }, [paymentMethods]);

  const handleFinalizePayment = async () => {
    if (!selectedPaymentMethodId) {
      toast.error('Please select a payment method before proceeding.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update transaction with selected payment method and status
      const response = await axios.put(`http://localhost:5000/api/transactions/${transactionId}`, {
        payment_method_id: parseInt(selectedPaymentMethodId),
        status: 'paid'
      });

      toast.success('Payment completed successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      console.log('Payment response:', response.data);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (err) {
      console.error('Payment finalization failed:', err);
      if (err.response?.data?.error) {
        toast.error(`Payment failed: ${err.response.data.error}`, {
          position: "top-right",
          autoClose: 4000,
        });
        setError('Payment failed: ' + err.response.data.error);
      } else {
        toast.error('An unexpected error occurred during payment.', {
          position: "top-right",
          autoClose: 4000,
        });
        setError('An unexpected error occurred during payment finalization.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
      </div>
    );
  }

  if (!transactionDetails) {
    return (
      <div className="error-message">
        <p>Transaction details not found.</p>
      </div>
    );
  }

  const { movie_title, showing_date, start_time, theater_name, booked_seats, total_amount } = transactionDetails;

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h2>Payment Summary</h2>

        <div className="transaction-summary">
          <p>Movie: <strong>{movie_title}</strong></p>
          <p>Date: <strong>{new Date(showing_date).toLocaleDateString()}</strong></p>
          <p>Time: <strong>{start_time ? start_time.substring(0, 5) : 'N/A'}</strong></p>
          <p>Theater: <strong>{theater_name}</strong></p>
          <p>Seats: <strong>{booked_seats}</strong></p>
          <p>Total Amount: <strong>{formatCurrency(total_amount)}</strong></p>
        </div>

        <div className="payment-methods">
          <h3>Select Payment Method</h3>
          {Object.entries(groupPaymentMethodsByType(paymentMethods, paymentMethodTypes)).map(([typeId, { typeName, methods }]) => (
            <div key={typeId} className="payment-category">
              <button
                className="category-header"
                onClick={() => setExpandedMethod(expandedMethod === typeId ? null : typeId)}
              >
                <span>{typeName}</span>
                <span className={`arrow ${expandedMethod === typeId ? 'expanded' : ''}`}>▼</span>
              </button>
              {expandedMethod === typeId && methods.length > 0 && (
                <div className="payment-options">
                  {methods.map((method) => (
                    <label key={method.payment_method_id} className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.payment_method_id}
                        checked={selectedPaymentMethodId === method.payment_method_id.toString()}
                        onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                      />
                      <span>{method.payment_method_name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleFinalizePayment}
          className={`pay-button ${selectedPaymentMethodId && !isLoading ? 'active' : ''}`}
          disabled={!selectedPaymentMethodId || isLoading}
        >
          {isLoading ? 'Processing Payment...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
};

export default Payment;
