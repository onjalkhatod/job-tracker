const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications'); // Added

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// Real endpoint mounting paths
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes); // Mounted application router

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});