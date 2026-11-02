/**
 * ==============================================================================
 * TaskFlow Backend Server
 * ==============================================================================
 * Course: MCA Semester 3 - Backend Technologies Lab
 * Project: TaskFlow - Task Management System with JWT Authentication
 * 
 * Concepts Demonstrated:
 * 1. Express Application Lifecycle and Server Bootstrap
 * 2. Environment Configuration using dotenv
 * 3. MongoDB Connection using Mongoose
 * 4. Built-in and Third-Party Middleware (CORS, Express JSON Body Parser, Morgan Logger)
 * 5. Modular RESTful Routing (/api/auth, /api/tasks)
 * 6. Centralized Error Handling Pipeline
 */

// Load environment variables from .env file before anything else
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Initialize MongoDB connection
connectDB();

// Initialize Express application
const app = express();

// ------------------------------------------------------------------------------
// Middleware Configuration
// ------------------------------------------------------------------------------

// Enable Cross-Origin Resource Sharing (CORS) for frontend React app
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// HTTP request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger in development mode
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ------------------------------------------------------------------------------
// Base & Health Routes
// ------------------------------------------------------------------------------

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: 'Connected'
  });
});

// Root API information endpoint (if requested explicitly with /api)
app.get('/api', (req, res) => {
  res.status(200).json({
    project: 'TaskFlow – Task Management System with JWT Authentication',
    subject: 'MCA Sem 3 Backend Technologies Lab',
    status: 'Running',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      health: '/api/health'
    }
  });
});

// ------------------------------------------------------------------------------
// Mount Modular API Routes
// ------------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ------------------------------------------------------------------------------
// Static Frontend Production Serving (if frontend/dist exists)
// ------------------------------------------------------------------------------
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  // Catch-all route to serve React index.html for client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // If dist is not yet built, provide API welcoming info on root
  app.get('/', (req, res) => {
    res.status(200).json({
      project: 'TaskFlow – Task Management System with JWT Authentication',
      subject: 'MCA Sem 3 Backend Technologies Lab',
      status: 'Running',
      version: '1.0.0',
      note: 'Frontend build not found in ../frontend/dist. Run "npm run build" in frontend folder to bundle React.'
    });
  });
}

// ------------------------------------------------------------------------------
// Centralized Error Handling Middleware Pipeline
// ------------------------------------------------------------------------------
// Catch-all for undefined routes (404)
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// ------------------------------------------------------------------------------
// Server Startup
// ------------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`TaskFlow Backend running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Server listening on port: http://localhost:${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

// Handle unhandled Promise rejections cleanly
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection Error]: ${err.message}`);
  // In production, consider closing the server gracefully:
  // server.close(() => process.exit(1));
});

module.exports = app;
