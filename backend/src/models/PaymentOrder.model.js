const mongoose = require('mongoose');

/**
 * Server-side record of every Razorpay order we create for flows that had no
 * pending record of their own (premium job-seeker pass, paid job listings).
 *
 * Verification binds against this: it proves *who* the order was created for,
 * *what* it was for, and *how much* was expected — none of which the Razorpay
 * signature covers, and none of which may be taken from the request body.
 */
const paymentOrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    purpose: {
        type: String,
        enum: ['premium_seeker', 'job_listing'],
        required: true
    },
    /** Amount in paise, exactly as sent to Razorpay. */
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true
    },
    razorpayPaymentId: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
        index: true
    },
    /** Flow-specific context captured at order time, e.g. listingType. */
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    consumedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('PaymentOrder', paymentOrderSchema);
