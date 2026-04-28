const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    user_id: {
        type: String,
        required: true,
        ref: 'User'
    },
    expires_at: {
        type: Date,
        required: true
    },
    is_revoked: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);