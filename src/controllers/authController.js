const authService = require('../services/authService');

const githubAuth = (req, res) => {
    const { state, code_challenge, redirect_uri } = req.query;

    // If no state provided, generate one for web flow
    const authState = state || Buffer.from(JSON.stringify({
        redirect_type: 'web',
        code_verifier: 'web-flow'
    })).toString('base64');

    // Store state and code_challenge for verification (in production, use a cache)
    // For now, we'll pass them back via state parameter

    const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${process.env.GITHUB_CLIENT_ID}` +
        `&redirect_uri=${redirect_uri || process.env.GITHUB_REDIRECT_URI}` +
        `&state=${authState}` +
        `&scope=user:email`;

    res.redirect(githubAuthUrl);
};

const githubCallback = async (req, res) => {
    try {
        const { code, state } = req.query;

        // Parse state to determine redirect type
        let redirect_type = 'web';
        let code_verifier = null;

        try {
            const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
            redirect_type = stateData.redirect_type || 'web';
            code_verifier = stateData.code_verifier;
        } catch (e) {
            // Web flow - no code verifier needed
            redirect_type = 'web';
        }

        // For web flow, we don't need PKCE
        if (redirect_type === 'web') {
            const axios = require('axios');

            // Exchange code for GitHub token (without code_verifier for web)
            const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: process.env.GITHUB_REDIRECT_URI
            }, {
                headers: { Accept: 'application/json' }
            });

            const githubToken = tokenResponse.data.access_token;

            if (!githubToken) {
                throw new Error('Failed to get GitHub token');
            }

            // Get GitHub user
            const userResponse = await axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${githubToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            });

            const githubUser = userResponse.data;

            // Find or create user
            const User = require('../models/User');
            const { generateAccessToken, generateRefreshToken } = require('../utils/tokenManager');

            let user = await User.findOne({ github_id: githubUser.id.toString() });

            if (!user) {
                user = await User.create({
                    github_id: githubUser.id.toString(),
                    username: githubUser.login,
                    email: githubUser.email,
                    avatar_url: githubUser.avatar_url,
                    role: 'analyst',
                    last_login_at: new Date()
                });
            } else {
                user.last_login_at = new Date();
                user.username = githubUser.login;
                user.avatar_url = githubUser.avatar_url;
                if (githubUser.email) user.email = githubUser.email;
                await user.save();
            }

            // Generate tokens
            const accessToken = generateAccessToken(user);
            const refreshToken = await generateRefreshToken(user.id);

            // Set HTTP-only cookies for web
            res.cookie('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3 * 60 * 1000
            });

            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 5 * 60 * 1000
            });

            // Redirect to web portal dashboard
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/`);
        }

        const result = await authService.handleGitHubCallback(code, code_verifier);

        const redirectUrl = `http://localhost:${process.env.CLI_CALLBACK_PORT || 8765}/callback?` +
            `access_token=${result.accessToken}&refresh_token=${result.refreshToken}`;

        return res.redirect(redirectUrl);

    } catch (error) {
        console.error('GitHub callback error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Authentication failed: ' + error.message
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({
                status: 'error',
                message: 'Refresh token required'
            });
        }

        const tokens = await authService.refreshTokens(refresh_token);

        res.json({
            status: 'success',
            ...tokens
        });
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Invalid refresh token'
        });
    }
};

const logout = async (req, res) => {
    try {
        const userId = req.user?.user_id;
        if (userId) {
            await authService.logout(userId);
        }

        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        res.json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Logout failed'
        });
    }
};

const whoami = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.user_id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
                avatar_url: user.avatar_url,
                last_login_at: user.last_login_at
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get user info'
        });
    }
};

module.exports = {
    githubAuth,
    githubCallback,
    refreshToken,
    logout,
    whoami
};