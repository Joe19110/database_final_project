# CinemaX - Movie Booking System

A modern, full-stack web application for cinema ticket booking with real-time seat selection and secure payment processing.

## Features

### For Customers
- Browse current and upcoming movies
- View detailed movie information and showtimes
- Real-time seat selection
- Secure booking process
- User profile management
- Booking history tracking

### Technical Features
- Real-time seat availability updates
- Automatic expiration of pending bookings
- Secure user authentication with Firebase
- Responsive design for all devices
- Modern UI with smooth transitions
- JWT-based API security

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Firebase Authentication
- Axios for API calls
- React Router for navigation

### Backend
- Node.js with Express
- MySQL Database
- JWT for API security
- bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd cinema-booking-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Create the database
mysql -u root -p < schema.sql

# Load mock data (optional)
mysql -u root -p < mock_data.sql
```

4. Configure environment variables:
Create a `.env` file in the root directory with the following:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=cinema_booking
JWT_SECRET=your_jwt_secret
FIREBASE_API_KEY=your_firebase_api_key
```

5. Start the development server:
```bash
npm run dev
```

## Database Schema

### Core Tables
- `movies` - Movie information and metadata
- `showings` - Movie showtimes and theater assignments
- `theaters` - Theater information and seating layout
- `customers` - User profiles and authentication data
- `transactions` - Booking transactions and payment status
- `seat_bookings` - Individual seat reservations

### Supporting Tables
- `genres` - Movie genres
- `age_ratings` - Movie age ratings
- `theater_types` - Different types of theaters and pricing
- `payment_methods` - Available payment methods

## API Endpoints

### Authentication
- POST `/api/customers` - Register new customer
- GET `/api/customers/:id` - Get customer profile
- PUT `/api/customers/:id` - Update customer profile

### Movies and Showings
- GET `/api/movies` - List all movies
- GET `/api/movies/:id` - Get movie details and showings
- GET `/api/booked_seats` - Get booked seats for a showing

### Bookings
- POST `/api/bookings` - Create new booking
- PUT `/api/transactions/:id` - Update transaction status
- GET `/api/customers/:id/history` - Get customer booking history

## Security Features

- Firebase Authentication
- JWT token validation
- Password hashing with bcrypt
- SQL injection prevention
- CORS protection
- Rate limiting
- Automatic session expiry

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Firebase for authentication services
- MySQL team for the database system
- React team for the frontend framework
- All contributors and testers
