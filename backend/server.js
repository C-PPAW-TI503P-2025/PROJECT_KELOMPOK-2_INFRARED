const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models');
const trashRoutes = require('./routes/trashRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files dari folder frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
// Root route - serve dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'IR Trash Monitoring API',
    version: '1.0.0',
    endpoints: {
      'POST /api/trash/entries': 'Add new trash entry',
      'GET /api/trash/daily': 'Get daily count (query: date, sensor_id)',
      'GET /api/trash/statistics': 'Get statistics (query: start_date, end_date, sensor_id)',
      'GET /api/trash/entries': 'Get all entries with pagination (query: page, limit, sensor_id)',
      'GET /api/trash/dashboard': 'Get dashboard summary',
      'DELETE /api/trash/entries/:id': 'Delete entry by ID'
    }
  });
});

app.use('/api/trash', trashRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database models
    await syncDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Dashboard available at http://localhost:${PORT}`);
      console.log(`📚 API Documentation available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
