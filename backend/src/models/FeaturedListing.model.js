const mongoose = require('mongoose');

const featuredListingSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    logo: {
        type: String, // Cloudinary URL
        required: true
    },
    description: {
        type: String,
        required: true,
        maxLength: 200
    },
    contactNumber: {
        type: String,
        required: true
    },
    websiteUrl: {
        type: String,
        required: true
    },
    slotNumber: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4, 5],
        unique: true // Ensure only one business per slot at a time
    },
    subscriptionId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'inactive'
    },
    expiryDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const FeaturedListing = mongoose.model('FeaturedListing', featuredListingSchema);

module.exports = FeaturedListing;
