const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getMongoStatus } = require('./config/db');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const contactRoutes = require('./routes/contactRoutes');
const statsRoutes = require('./routes/statsRoutes');
const { seedDB } = require('./seed/seedData');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Praveen Portfolio REST API',
    mongoConnected: getMongoStatus(),
    timestamp: new Date().toISOString(),
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Initialize database
connectDB().then(() => {
  if (getMongoStatus()) {
    seedDB();
  }
});

// Export app for Vercel
module.exports = app;
