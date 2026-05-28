require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 1. Initialize the Express application (This can only happen ONCE!)
const app = express();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Connect your Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// 4. Your original placeholder routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/applications', (req, res) => {
  res.json([]);
});

app.post('/api/applications', (req, res) => {
  res.json({ message: 'created' });
});

// 5. Start the Engine
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});