const { verifyAccessToken } = require('../utils/tokenManager');

const authenticate = (req, res, next) => {
    // Check cookie first (web), then Authorization header (CLI)
    let token = null;

    if (req.cookies && req.cookies.access_token) {
        token = req.cookies.access_token;
    } else if (req.headers.authorization) {
        token = req.headers.authorization.replace('Bearer ', '');
    }

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Authentication required'
        });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token'
        });
    }

    req.user = decoded;
    next();
};

module.exports = { authenticate };