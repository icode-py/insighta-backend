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
    validate: false // Suppress IPv6 warning for now
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: {
        status: 'error',
        message: 'Too many requests, please try again later'
    },
    keyGenerator: (req) => {
        return req.user?.user_id || 'anonymous';
    },
    validate: false
});

module.exports = { authLimiter, apiLimiter };