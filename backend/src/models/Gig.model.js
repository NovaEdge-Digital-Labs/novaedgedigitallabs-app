const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencing User directly for convenience in some lookups
        required: true
    },
    title: {
        type: String,
        required: [true, 'Gig title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    deliveryDays: {
        type: Number,
        required: [true, 'Delivery time is required'],
        min: 1
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    images: [{
        type: String // Cloudinary URLs
    }],
    features: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    totalOrders: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Gig', gigSchema);
