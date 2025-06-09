// db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Create the connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'cinema_booking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: Test the connection
db.getConnection()
  .then(connection => {
    console.log('Database connected successfully!');
    connection.release(); // Release the connection immediately after testing
  })
  .catch(err => {
    console.error('Database connection failed:', err.stack);
    // Depending on severity, you might want to exit the application here
    // process.exit(1);
  });

// Export the promise-based pool
export default db;
