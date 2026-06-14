const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const interviewRoutes = require('./routes/interviews');
const { runSeedScript } = require('./prisma/seedUtils');

const app = express();

// Middleware
app.use(express.json());

const prisma = require('./prismaClient');

// CORS Configuration - Securely restricted to your frontend URL
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

async function checkDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Successfully connected to database!");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
}

checkDatabase();

// Admin Reset Endpoint - Triggered via secret key for environment refresh
app.post('/api/admin/reset-demo', async (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_SEED_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  try {
    await runSeedScript(prisma);
    res.status(200).json({ message: "Demo data reset successfully." });
  } catch (error) {
    console.error('Reset Error:', error);
    res.status(500).json({ error: "Failed to reset demo data." });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);

// Global Error Handler Middleware - Keeps the server stable
app.use((err, req, res, next) => {
  console.error('Global Error Caught:', err.message);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});