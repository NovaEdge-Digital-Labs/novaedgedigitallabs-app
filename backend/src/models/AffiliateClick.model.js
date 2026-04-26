const mongoose = require('mongoose');

const affiliateClickSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // User might not be logged in for some flows, though user requested they can browse without login
    },
    link: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AffiliateLink',
        required: true
    },
    serviceName: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        enum: ['ios', 'android', 'web', 'other'],
        default: 'other'
    }
}, { timestamps: true });

module.exports = mongoose.model('AffiliateClick', affiliateClickSchema);
