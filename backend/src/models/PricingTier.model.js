const mongoose = require('mongoose');

const pricingTierSchema = new mongoose.Schema({
    tierId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['job_posting', 'seeker_membership', 'business_subscription', 'app_subscription'],
        default: 'job_posting'
    },
    price: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    badge: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    features: [{
        type: String
    }],
    durationDays: {
        type: Number,
        default: 30
    },
    billingPrices: {
        monthly: { type: Number, default: 0 },
        yearly: { type: Number, default: 0 }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('PricingTier', pricingTierSchema);
