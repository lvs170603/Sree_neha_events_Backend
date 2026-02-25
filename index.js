require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const serviceRoutes = require('./routes/serviceRoutes');
const bannerRoutes = require('./routes/bannerRoutes');

const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', serviceRoutes);
app.use('/api/banners', bannerRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/srinehaevents')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Global Error Handler to catch silent errors like Multer exceptions
app.use((err, req, res, next) => {
    console.error('[GLOBAL ERROR]', err.message, err.stack);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
