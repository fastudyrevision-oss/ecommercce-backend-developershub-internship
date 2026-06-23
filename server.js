const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

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

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// Centralized error handler (must be after route mounting)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer().catch((err) => {
  console.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
