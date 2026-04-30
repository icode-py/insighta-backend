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
    validate: false
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: {
        status: 'error',
        message: 'Too many requests, please try again later'
    },
    validate: false
});

module.exports = { authLimiter, apiLimiter };