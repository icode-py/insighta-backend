const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const ACCESS_TOKEN_EXPIRY = '3m';
const REFRESH_TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            user_id: user.id,
            role: user.role,
            username: user.username
        },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

const generateRefreshToken = async (userId) => {
    // Invalidate old refresh tokens for this user
    await RefreshToken.updateMany(
        { user_id: userId, is_revoked: false },
        { is_revoked: true }
    );

    const token = crypto.randomBytes(64).toString('hex');

    await RefreshToken.create({
        token,
        user_id: userId,
        expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS)
    });

    return token;
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const verifyRefreshToken = async (token) => {
    const refreshToken = await RefreshToken.findOne({
        token,
        is_revoked: false,
        expires_at: { $gt: new Date() }
    });

    if (!refreshToken) return null;

    // Revoke the used refresh token (rotation)
    refreshToken.is_revoked = true;
    await refreshToken.save();

    return refreshToken;
};

const revokeUserTokens = async (userId) => {
    await RefreshToken.updateMany(
        { user_id: userId, is_revoked: false },
        { is_revoked: true }
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    revokeUserTokens
};