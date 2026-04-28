const axios = require('axios');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, revokeUserTokens } = require('../utils/tokenManager');

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';

const exchangeCodeForToken = async (code, codeVerifier) => {
    const response = await axios.post(GITHUB_TOKEN_URL, {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
        code_verifier: codeVerifier
    }, {
        headers: { Accept: 'application/json' }
    });

    return response.data.access_token;
};

const getGitHubUser = async (accessToken) => {
    const response = await axios.get(GITHUB_USER_URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json'
        }
    });

    return response.data;
};

const findOrCreateUser = async (githubUser) => {
    let user = await User.findOne({ github_id: githubUser.id.toString() });

    if (!user) {
        user = await User.create({
            github_id: githubUser.id.toString(),
            username: githubUser.login,
            email: githubUser.email,
            avatar_url: githubUser.avatar_url,
            role: 'analyst', // Default role
            last_login_at: new Date()
        });
    } else {
        user.last_login_at = new Date();
        user.username = githubUser.login;
        user.avatar_url = githubUser.avatar_url;
        if (githubUser.email) user.email = githubUser.email;
        await user.save();
    }

    return user;
};

const handleGitHubCallback = async (code, codeVerifier) => {
    // Exchange code for GitHub access token
    const githubToken = await exchangeCodeForToken(code, codeVerifier);

    // Get GitHub user info
    const githubUser = await getGitHubUser(githubToken);

    // Find or create user
    const user = await findOrCreateUser(githubUser);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    return {
        user,
        accessToken,
        refreshToken
    };
};

const refreshTokens = async (oldRefreshToken) => {
    const tokenDoc = await verifyRefreshToken(oldRefreshToken);
    if (!tokenDoc) {
        throw new Error('Invalid refresh token');
    }

    const user = await User.findById(tokenDoc.user_id);
    if (!user || !user.is_active) {
        throw new Error('User not found or inactive');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    return { accessToken, refreshToken };
};

const logout = async (userId) => {
    await revokeUserTokens(userId);
};

module.exports = {
    handleGitHubCallback,
    refreshTokens,
    logout
};