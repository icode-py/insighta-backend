const crypto = require('crypto');

const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const csrfProtection = (req, res, next) => {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const tokenFromCookie = req.cookies?.['csrf-token'];
    const tokenFromHeader = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];

    if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
        return res.status(403).json({
            status: 'error',
            message: 'Invalid CSRF token'
        });
    }

    next();
};

module.exports = { generateCSRFToken, csrfProtection };