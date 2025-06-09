import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Booking.css'; // New CSS stylesheet
import { auth } from '../firebase'; // Implied import for auth
import { formatCurrency } from '../utils/formatCurrency';

const Booking = () => {
  const { showingId } = useParams();
  console.log('Booking component - useParams showingId:', showingId);
  const navigate = useNavigate(); // Initialize navigate
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [layout, setLayout] = useState({ totalRows: 0, totalColumns: 0 });
  const [bookedSeats, setBookedSeats] = useState([]);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const theaterRes = await axios.get(`http://localhost:5000/api/hall/${showingId}`);
        const { totalRows, totalColumns } = theaterRes.data;
        setLayout({ totalRows, totalColumns });

        const bookedRes = await axios.get(`http://localhost:5000/api/booked_seats?showing_id=${showingId}`);
        setBookedSeats(bookedRes.data);

        const priceRes = await axios.get(`http://localhost:5000/api/ticket_price/${showingId}`);
        setTicketPrice(priceRes.data.ticket_price);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load booking data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showingId]);

  const handleSeatClick = (row, column) => {
    const seatId = `${row}${column}`;
    setSelectedSeats(prev => 
      prev.some(s => `${s.row}${s.column}` === seatId)
        ? prev.filter(s => `${s.row}${s.column}` !== seatId)
        : [...prev, { row, column }]
    );
    if (error?.includes('seat')) {
       setError(null);
    }
  };

  const generateSeatGrid = () => {
    const grid = [];
    const columnLabels = [];

    // Generate column labels (numbers)
    for (let j = 1; j <= layout.totalColumns; j++) {
      columnLabels.push(
        <div key={`col-${j}`} className="seat-column-label">
          {j}
        </div>
      );
    }

    grid.push(
      <div key="column-labels" className="seat-row">
        <div className="row-label"></div>
        {columnLabels}
      </div>
    );

    // Generate seat rows
    for (let i = 0; i < layout.totalRows; i++) {
      const rowLabel = String.fromCharCode(65 + i);
      const rowSeats = [];

      for (let j = 1; j <= layout.totalColumns; j++) {
        const seatId = `${rowLabel}${j}`;
        const isBooked = bookedSeats.includes(seatId);
        const isSelected = selectedSeats.some(s => `${s.row}${s.column}` === seatId);

        rowSeats.push(
          <button
            key={seatId}
            onClick={() => !isBooked && handleSeatClick(rowLabel, j)}
            disabled={isBooked}
            className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
          />
        );
      }

      grid.push(
        <div key={`row-${rowLabel}`} className="seat-row">
          <div className="row-label">{rowLabel}</div>
          {rowSeats}
        </div>
      );
    }
    return grid;
  };

  const handleSubmitBooking = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    const customerId = auth.currentUser?.uid;
    if (!customerId) {
      alert('You need to be logged in to book seats.');
      return;
    }

    setIsBooking(true);
    setError(null);

    const seatRows = selectedSeats.map(seat => seat.row);
    const seatColumns = selectedSeats.map(seat => seat.column);
    const showingIdForBooking = showingId;
    const totalPrice = selectedSeats.length * ticketPrice;

    try {
      const response = await axios.post('http://localhost:5000/api/bookings', {
        customer_id: customerId,
        showing_id: showingIdForBooking,
        seat_rows: seatRows,
        seat_columns: seatColumns,
        total_amount: totalPrice,
      });

      const { transaction_id } = response.data;

      navigate(`/payment/${transaction_id}`);

    } catch (err) {
      console.error('Booking failed:', err);
      if (err.response && err.response.status === 409) {
        alert('One or more selected seats are no longer available. Please refresh and select again.');
      } else if (err.response && err.response.data && err.response.data.error) {
         setError('Booking failed: ' + err.response.data.error);
      } else {
        setError('An unexpected error occurred during booking.');
      }
    } finally {
       setIsBooking(false);
    }
  };

  const totalPrice = selectedSeats.length * ticketPrice;

  return (
    <div className="booking-container">
      <div className="booking-card">
        <h1>Choose Your Seats</h1>
        
        <div className="seat-grid-container">
          {generateSeatGrid()}
        </div>

        <div className="booking-summary">
          <p>
            Selected Seats: <span className="selected-seats">
              {selectedSeats.length > 0 ? 
                selectedSeats.map(s => `${s.row}${s.column}`).join(', ') : 
                'None selected'}
            </span>
          </p>
          <p>Total Price: <span className="total-price">{formatCurrency(totalPrice)}</span></p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleSubmitBooking}
          className={`payment-button ${selectedSeats.length > 0 && !isBooking ? 'active' : ''}`}
          disabled={selectedSeats.length === 0 || isBooking || isLoading}
        >
          {isBooking ? 'Proceeding...' : 'Proceed to Payment'}
        </button>


        <div className="seat-legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="legend-color booked"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
