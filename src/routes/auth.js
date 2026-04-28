const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.get('/github', authController.githubAuth);
router.get('/github/callback', authController.githubCallback);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/whoami', authenticate, authController.whoami);

module.exports = router;