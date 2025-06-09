import express from 'express';
import cors from 'cors';
import db from './src/db.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcryptjs';
import { generateToken, authenticateToken } from './src/utils/jwt.js';

// Configure dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory (if you use it)
// If images are in the root, this might also serve them depending on Vite config.
app.use(express.static('public'));
// If images are also in the root, you might need to serve root as static as well,
// but be careful not to expose sensitive files.
// app.use(express.static(__dirname)); // Might serve from root, be cautious

// Routes
app.get('/api/movies', async (req, res) => {
  try {
    const [movies] = await db.query('SELECT * FROM movies WHERE status = "active"');
    res.json(movies);
  } catch (err) {
    console.error('Database error fetching movies:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  try {
    console.log(`Fetching movie with id: ${req.params.id}`);
    const [movie] = await db.query(`
      SELECT 
        m.movie_id,
        m.movie_title,
        m.movie_description,
        CAST(m.movie_duration AS UNSIGNED) as movie_duration,
        m.poster_url,
        m.release_date,
        m.status,
        g.genre_name,
        ar.age_rating_name
      FROM movies m
      LEFT JOIN genres g ON m.genre_id = g.genre_id
      LEFT JOIN age_ratings ar ON m.age_rating_id = ar.age_rating_id
      WHERE m.movie_id = ?
    `, [req.params.id]);

    if (movie.length === 0) {
      console.log(`Movie with id ${req.params.id} not found.`);
      return res.status(404).json({ error: 'Movie not found' });
    }
    console.log('Movie found:', movie[0].movie_title);
    console.log('Movie details:', movie[0]);

    console.log(`Fetching showings for movie id: ${req.params.id}`);
    const [showings] = await db.query(`
      SELECT s.*, t.theater_name 
      FROM showings s
      JOIN theaters t ON s.theater_id = t.theater_id
      WHERE s.movie_id = ?
      AND TIMESTAMP(s.showing_date, s.start_time) > DATE_ADD(NOW(), INTERVAL 30 MINUTE)
      ORDER BY s.showing_date, s.start_time
    `, [req.params.id]);

    console.log(`Found ${showings.length} showings.`);

    res.json({ movie: movie[0], showings });
  } catch (err) {
    console.error('Error fetching movie details:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/hall/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Received showing_id:', id);
  try {
    const [showing] = await db.query('SELECT theater_id FROM showings WHERE showing_id = ?', [id]);

    if (showing.length === 0) {
      return res.status(404).json({ error: 'Showing not found' });
    }

    const theater_id = showing[0].theater_id;

    const [layout] = await db.query(`
      SELECT num_rows AS totalRows, num_columns AS totalColumns
      FROM theaters
      WHERE theater_id = ?`, [theater_id]);

    if (layout.length === 0) {
      return res.status(404).json({ error: 'Theater layout not found' });
    }

    res.json(layout[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/booked_seats', async (req, res) => {
  const { showing_id } = req.query;
  try {
    const [bookedSeats] = await db.query('SELECT seat_row, seat_column FROM seat_bookings WHERE showing_id = ?', [showing_id]);
    res.json(bookedSeats.map(seat => `${seat.seat_row}${seat.seat_column}`));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
  const { customer_id, showing_id, seat_rows, seat_columns, total_amount } = req.body;
  if (!customer_id || !showing_id || !Array.isArray(seat_rows) || !Array.isArray(seat_columns) || seat_rows.length !== seat_columns.length || total_amount === undefined) {
    return res.status(400).json({ error: 'Invalid booking data' });
  }
  try {
    const seatPairs = seat_rows.map((row, i) => [row, seat_columns[i]]);
    let seatConditions = seatPairs.map(() => '(seat_row = ? AND seat_column = ?)').join(' OR ');
    let seatValues = seatPairs.flat();
    const [bookedSeats] = await db.query(
      `SELECT seat_row, seat_column FROM seat_bookings WHERE showing_id = ? AND (${seatConditions})`,
      [showing_id, ...seatValues]
    );
    if (bookedSeats.length > 0) {
      return res.status(400).json({
        error: 'One or more selected seats are already booked.',
        bookedSeats: bookedSeats.map(seat => `Row ${seat.seat_row}, Column ${seat.seat_column}`)
      });
    }
    const [transaction] = await db.query(
      'INSERT INTO transactions (customer_id, showing_id, status, expiry_time, total_amount) VALUES (?, ?, "pending", DATE_ADD(NOW(), INTERVAL 15 MINUTE), ?)',
      [customer_id, showing_id, total_amount]
    );
    const transaction_id = transaction.insertId;
    for (let i = 0; i < seat_rows.length; i++) {
      await db.query(
        'INSERT INTO seat_bookings (transaction_id, showing_id, seat_row, seat_column) VALUES (?, ?, ?, ?)',
        [transaction_id, showing_id, seat_rows[i], seat_columns[i]]
      );
    }
    res.json({ transaction_id, message: 'Seats reserved. Proceed to payment.' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'One or more selected seats are no longer available. Please refresh and try again.' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  const { customer_name, customer_email, firebase_uid } = req.body;
  console.log('Received customer registration data:', req.body);

  if (!customer_name || !customer_email || !firebase_uid) {
    return res.status(400).json({ error: 'Missing required fields (name, email, firebase_uid)' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customer_email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const [existingCustomers] = await db.query('SELECT customer_id FROM customers WHERE customer_id = ?', [firebase_uid]);

    if (existingCustomers.length > 0) {
      console.warn(`Customer with firebase_uid ${firebase_uid} already exists.`);
      // Generate token even for existing users
      const token = generateToken(firebase_uid);
      return res.status(200).json({ 
        success: true, 
        customer_id: firebase_uid,
        token: token 
      });
    }

    const sql = `INSERT INTO customers (customer_id, customer_name, customer_email, created_at, last_update_time)
                 VALUES (?, ?, ?, NOW(), NOW())`;
    await db.query(sql, [firebase_uid, customer_name, customer_email]);

    console.log(`Customer registered successfully with firebase_uid: ${firebase_uid}`);
    
    // Generate token for new users
    const token = generateToken(firebase_uid);
    res.status(201).json({ 
      success: true, 
      customer_id: firebase_uid,
      token: token 
    });

  } catch (err) {
    console.error('Database error during customer registration:', err);
    res.status(500).json({ error: 'Failed to insert user' });
  }
});

app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
  const { status, payment_method_id } = req.body;
  if (!status && !payment_method_id) {
    return res.status(400).json({ error: 'Either status or payment_method_id is required' });
  }
  try {
    if (payment_method_id) {
      await db.query('UPDATE transactions SET payment_method_id = ? WHERE transaction_id = ?', [payment_method_id, req.params.id]);
    }
    if (status) {
      await db.query('UPDATE transactions SET status = ? WHERE transaction_id = ?', [status, req.params.id]);
    }
    res.json({ message: 'Transaction updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/transactions/:id', authenticateToken, async (req, res) => {
  const transactionId = req.params.id;
  try {
    const [transactionDetails] = await db.query(`
      SELECT 
        t.transaction_id,
        t.customer_id,
        t.showing_id,
        t.status AS transaction_status,
        t.expiry_time,
        t.total_amount,
        t.created_at,
        s.showing_date,
        s.start_time,
        m.movie_id,
        m.movie_title,
        m.poster_url,
        th.theater_name,
        GROUP_CONCAT(CONCAT(sb.seat_row, sb.seat_column) ORDER BY sb.seat_row, sb.seat_column SEPARATOR ', ') AS booked_seats
      FROM transactions t
      JOIN showings s ON t.showing_id = s.showing_id
      JOIN movies m ON s.movie_id = m.movie_id
      JOIN theaters th ON s.theater_id = th.theater_id
      JOIN seat_bookings sb ON t.transaction_id = sb.transaction_id
      WHERE t.transaction_id = ?
      GROUP BY t.transaction_id
    `, [transactionId]);

    if (transactionDetails.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transactionDetails[0]);

  } catch (err) {
    console.error('Error fetching transaction details:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/payment_methods', async (req, res) => {
  try {
    const query = `
      SELECT 
        pm.payment_method_id,
        pm.payment_method_name,
        pm.payment_method_type_id,
        pmt.payment_method_type_name as payment_method_type
      FROM payment_methods pm
      JOIN payment_method_types pmt ON pm.payment_method_type_id = pmt.payment_method_type_id
      ORDER BY pmt.payment_method_type_name, pm.payment_method_name
    `;
    const [result] = await db.query(query);
    res.json(result);
  } catch (err) {
    console.error('Error fetching payment methods:', err);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

app.get('/api/ticket_price/:showing_id', async (req, res) => {
  const { showing_id } = req.params;
  try {
    const [showingInfo] = await db.query(`
      SELECT s.showing_date, th.theater_type_id
      FROM showings s
      JOIN theaters th ON s.theater_id = th.theater_id
      WHERE s.showing_id = ?
    `, [showing_id]);

    if (showingInfo.length === 0) {
      return res.status(404).json({ error: 'Showing not found' });
    }

    const { showing_date, theater_type_id } = showingInfo[0];

    const date = new Date(showing_date);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;

    const [priceInfo] = await db.query(`
      SELECT weekday_ticket_price, weekend_ticket_price
      FROM theater_types
      WHERE theater_type_id = ?
    `, [theater_type_id]);

    if (priceInfo.length === 0) {
      return res.status(404).json({ error: 'Theater type price not found' });
    }

    const { weekday_ticket_price, weekend_ticket_price } = priceInfo[0];

    const ticket_price = isWeekend ? weekend_ticket_price : weekday_ticket_price;

    res.json({ ticket_price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/:id', authenticateToken, async (req, res) => {
  // Verify that the requested customer ID matches the token's user ID
  if (req.params.id !== req.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  try {
    const [customer] = await db.query('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const { customer_password, ...safeCustomer } = customer[0];
    res.json(safeCustomer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/:id/history', authenticateToken, async (req, res) => {
  // Verify that the requested customer ID matches the token's user ID
  if (req.params.id !== req.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const customerId = req.params.id;
  console.log(`Fetching purchase history for customer: ${customerId}`);

  if (!customerId || typeof customerId !== 'string') {
    console.error('Invalid customer ID format:', customerId);
    return res.status(400).send('Invalid customer ID.');
  }

  try {
    // First, update any expired pending transactions to cancelled
    await db.query(`
      UPDATE transactions 
      SET status = 'cancelled' 
      WHERE status = 'pending' 
      AND expiry_time < NOW()
    `);

    const [customerRows] = await db.query('SELECT customer_id, customer_name, customer_email, customer_phone_number FROM customers WHERE customer_id = ?', [customerId]);
    const customer = customerRows.length > 0 ? customerRows[0] : null;

    if (!customer) {
      console.warn(`Customer with customer_id (firebase_uid) ${customerId} not found in DB.`);
      return res.status(404).send('Customer not found.');
    }

    const [historyRows] = await db.query(`
      SELECT
        t.transaction_id,
        t.created_at,
        t.total_amount,
        t.status,
        pm.payment_method_name,
        t.expiry_time,
        s.showing_id,
        m.movie_title,
        s.showing_date,
        s.start_time,
        th.theater_name,
        m.poster_url,
        GROUP_CONCAT(DISTINCT CONCAT(sb.seat_row, sb.seat_column) ORDER BY sb.seat_row, sb.seat_column SEPARATOR ', ') AS seats
      FROM
        transactions t
      JOIN
        seat_bookings sb ON t.transaction_id = sb.transaction_id
      JOIN
        showings s ON sb.showing_id = s.showing_id
      JOIN
        movies m ON s.movie_id = m.movie_id
      JOIN
        theaters th ON s.theater_id = th.theater_id
      LEFT JOIN
        payment_methods pm ON t.payment_method_id = pm.payment_method_id
      WHERE
        t.customer_id = ?
      GROUP BY
        t.transaction_id, t.created_at, t.total_amount, t.status, pm.payment_method_name, t.expiry_time, s.showing_id, m.movie_title, s.showing_date, s.start_time, th.theater_name, m.poster_url
      ORDER BY
        t.created_at DESC;
    `, [customer.customer_id]);

    res.json({ customer: customer, history: historyRows });

  } catch (err) {
    console.error('Database error fetching purchase history:', err);
    res.status(500).send('Error fetching purchase history.');
  }
});

// Payment Method Types endpoint
app.get('/api/payment_method_types', async (req, res) => {
  try {
    const query = 'SELECT payment_method_type_id, payment_method_type_name FROM payment_method_types';
    const [result] = await db.query(query);
    res.json(result);
  } catch (err) {
    console.error('Error fetching payment method types:', err);
    res.status(500).json({ error: 'Failed to fetch payment method types' });
  }
});

// Update customer profile
app.put('/api/customers/:id', authenticateToken, async (req, res) => {
  // Verify that the requested customer ID matches the token's user ID
  if (req.params.id !== req.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { customer_name, customer_phone_number } = req.body;

  // Validate input
  if (!customer_name || customer_name.trim() === '') {
    return res.status(400).json({ error: 'Name cannot be empty' });
  }

  // Phone number validation (optional field)
  if (customer_phone_number && customer_phone_number.trim() !== '') {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    if (!phoneRegex.test(customer_phone_number)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
  }

  try {
    // Check if phone number is already used by another customer
    if (customer_phone_number && customer_phone_number.trim() !== '') {
      const [existingCustomer] = await db.query(
        'SELECT customer_id FROM customers WHERE customer_phone_number = ? AND customer_id != ?',
        [customer_phone_number, req.params.id]
      );
      
      if (existingCustomer.length > 0) {
        return res.status(409).json({ error: 'Phone number is already in use' });
      }
    }

    // Update customer details
    await db.query(
      'UPDATE customers SET customer_name = ?, customer_phone_number = ?, last_update_time = NOW() WHERE customer_id = ?',
      [customer_name, customer_phone_number || null, req.params.id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating customer profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
