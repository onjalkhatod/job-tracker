const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const interviewRoutes = require('./routes/interviews');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// Real endpoint mounting paths
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes); 
app.use('/api/interviews', interviewRoutes);

// Global Error Handler Middleware (Must be at the very bottom)
app.use((err, req, res, next) => {
  console.error('Global Error Caught:', err.message);
  
  // Return a clean error payload instead of crashing the process
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {});