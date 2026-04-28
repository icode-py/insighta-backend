const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => require('../utils/uuid').generateUUIDv7()
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    gender_probability: {
        type: Number,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    age_group: {
        type: String,
        enum: ['child', 'teenager', 'adult', 'senior'],
        required: true
    },
    country_id: {
        type: String,
        required: true,
        uppercase: true
    },
    country_name: {
        type: String,
        required: true
    },
    country_probability: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: () => new Date()
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
    },
    toObject: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes for performance
profileSchema.index({ gender: 1 });
profileSchema.index({ age_group: 1 });
profileSchema.index({ country_id: 1 });
profileSchema.index({ age: 1 });
profileSchema.index({ gender_probability: 1 });
profileSchema.index({ country_probability: 1 });
profileSchema.index({ created_at: 1 });


module.exports = mongoose.model('Profile', profileSchema);