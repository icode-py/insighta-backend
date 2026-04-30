const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        status: 'error',
        message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    skip: false // Ensure it's not skipping
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: {
        status: 'error',
        message: 'Too many requests, please try again later'
    },
    validate: false,
    skip: false
});

module.exports = { authLimiter, apiLimiter };