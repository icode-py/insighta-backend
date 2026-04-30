require('dotenv').config();

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const connectDB = require('./config/database');
const { requestLogger } = require('./middleware/logger');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');
const { authenticate } = require('./middleware/auth');
const authController = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 3000;

// Database
connectDB();

// Security
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(requestLogger);

// Trust proxy
app.set('trust proxy', 1);

// Routes
app.use('/auth', authLimiter, require('./routes/auth'));
app.use('/api/profiles', apiLimiter, require('./routes/profiles'));
app.get('/api/users/me', authenticate, authController.whoami);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'success', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});