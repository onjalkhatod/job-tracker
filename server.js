require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); 

// --- Routes ---
app.get('/health', (req, res) => {
    res.json({ status: "ok" }); 
});

app.get('/api/applications', (req, res) => {
    res.json([]);
});

app.post('/api/applications', (req, res) => {
    res.json({ message: "created" });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});