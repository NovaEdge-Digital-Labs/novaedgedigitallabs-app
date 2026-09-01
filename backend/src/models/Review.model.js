const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    targetType: {
        type: String,
        enum: ['product', 'gig', 'course', 'freelancer'],
        default: 'product'
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Ensure unique review per user per target
reviewSchema.index({ targetType: 1, targetId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
