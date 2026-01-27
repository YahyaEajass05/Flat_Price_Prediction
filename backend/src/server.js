/**
 * Main Server File
 * Express server with MongoDB, Authentication, and AI Integration
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database');
const logger = require('./config/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Flat Price Prediction API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      predictions: '/api/predictions',
      admin: '/api/admin',
    },
    documentation: 'API documentation available at /api/docs',
  });
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
const server = app.listen(PORT, () => {
  logger.info('='.repeat(80));
  logger.info(`🚀 Flat Price Prediction API Server`);
  logger.info('='.repeat(80));
  logger.info(`📍 Environment: ${NODE_ENV}`);
  logger.info(`🌐 Server running on port: ${PORT}`);
  logger.info(`🔗 API URL: http://localhost:${PORT}`);
  logger.info(`💾 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Waiting...'}`);
  logger.info(`🤖 AI Service: Ready`);
  logger.info('='.repeat(80));
  logger.info(`\n📋 Available Routes:`);
  logger.info(`   GET  /                          - API Information`);
  logger.info(`   GET  /api/health                - Health Check`);
  logger.info(`   POST /api/auth/register         - User Registration`);
  logger.info(`   POST /api/auth/login            - User Login`);
  logger.info(`   GET  /api/auth/me               - Get Profile`);
  logger.info(`   POST /api/predictions/predict   - Predict Price`);
  logger.info(`   GET  /api/predictions/history   - Prediction History`);
  logger.info(`   GET  /api/admin/users           - Get All Users (Admin)`);
  logger.info(`   GET  /api/admin/stats           - System Stats (Admin)`);
  logger.info('='.repeat(80));
  logger.info(`\n✅ Server is ready to accept requests!\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.error(err.stack);
  
  // Close server & exit process
  server.close(() => {
    logger.error('Server closed due to unhandled rejection');
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  logger.info('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
