const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bio: {
        type: String,
        required: [true, 'Bio is required']
    },
    skills: [{
        type: String,
        trim: true
    }],
    portfolio: [{
        title: String,
        url: String,
        description: String
    }],
    hourlyRate: {
        type: Number,
        required: true,
        min: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: [true, 'Professional title is required']
    }
}, { timestamps: true });

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);
