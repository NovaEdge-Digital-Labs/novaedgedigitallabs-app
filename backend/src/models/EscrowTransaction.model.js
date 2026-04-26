const mongoose = require('mongoose');

const escrowTransactionSchema = new mongoose.Schema({
    contractId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    platformFee: {
        type: Number,
        required: true
    },
    freelancerAmount: {
        type: Number,
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'held', 'released', 'refunded'],
        default: 'pending'
    },
    payoutId: {
        type: String // Razorpay Payout ID if automated
    },
    releasedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('EscrowTransaction', escrowTransactionSchema);
