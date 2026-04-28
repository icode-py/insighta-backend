const User = require('../models/User');

const authorize = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.user_id);

            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            if (!user.is_active) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Account is deactivated'
                });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Insufficient permissions'
                });
            }

            req.user.role = user.role;
            next();
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Authorization error'
            });
        }
    };
};

module.exports = { authorize };