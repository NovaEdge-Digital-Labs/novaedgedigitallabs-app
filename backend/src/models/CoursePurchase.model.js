const mongoose = require('mongoose');

const coursePurchaseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
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
        required: true
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure unique purchase per user per course
coursePurchaseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('CoursePurchase', coursePurchaseSchema);
