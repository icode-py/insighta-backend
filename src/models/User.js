const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => require('../utils/uuid').generateUUIDv7()
    },
    github_id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: null
    },
    avatar_url: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['admin', 'analyst'],
        default: 'analyst'
    },
    is_active: {
        type: Boolean,
        default: true
    },
    last_login_at: {
        type: Date,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false,
    versionKey: false,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = mongoose.model('User', userSchema);