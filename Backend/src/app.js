require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sanitizeBody } = require('./Middleware/validation');
const { createConnection } = require('./db');

const app = express();
const port = process.env.PORT || 8000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost on any port during development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }

    // Allow the configured frontend URL
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175'
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Input sanitization middleware
app.use(sanitizeBody);

const authRoutes = require('./Routes/login');
const employeeRoutes = require('./Routes/employee');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employee', employeeRoutes);

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'Backend is running ✅' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      message: 'Validation Error',
      errors: errors
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  // Default error
  res.status(500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong!'
      : err.message
  });
});

// 404 handler for unmatched routes\napp.use((req, res) => {\n  res.status(404).json({ message: 'Route not found' });\n});

const startServer = async () => {
  try {
    await createConnection();

    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
      console.log('🚀 Backend ready with DB connection!');
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
