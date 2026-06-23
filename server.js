const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security headers
app.use(helmet());

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));

// Sanitize data to prevent NoSQL injection
app.use(mongoSanitize());

// CORS — restrict origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim())
    : true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many requests, please try again later' },
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Ecommerce API' });
});

// Import Routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');

// Mount routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/inquiries', inquiryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
