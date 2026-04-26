const mongoose = require('mongoose');

const affiliateLinkSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tool name is required'],
        trim: true
    },
    logo: {
        type: String,
        required: [true, 'Logo URL is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    rating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5
    },
    trackingUrl: {
        type: String,
        required: [true, 'Tracking URL is required']
    },
    category: {
        type: String,
        default: 'General'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('AffiliateLink', affiliateLinkSchema);
