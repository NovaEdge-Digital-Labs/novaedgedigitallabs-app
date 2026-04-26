const mongoose = require('mongoose');

const premiumJobSeekerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String
}, { timestamps: true });

module.exports = mongoose.model('PremiumJobSeeker', premiumJobSeekerSchema);
