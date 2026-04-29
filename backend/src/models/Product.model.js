const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
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
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['resume', 'invoice', 'ui-kit', 'landing-page', 'figma-kit', 'other']
    },
    images: [{
        type: String, // Cloudinary URLs
        required: true
    }],
    zipUrl: {
        type: String, // Secure download URL/key
        required: true
    },
    zipPublicId: {
        type: String, // Cloudinary Public ID for deletion/management
        required: false,
        default: 'manual'
    },
    tags: [String],
    features: [String],
    totalSales: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
