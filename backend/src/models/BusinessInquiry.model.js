const mongoose = require('mongoose');

const businessInquirySchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    ownerName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    message: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'closed', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const BusinessInquiry = mongoose.model('BusinessInquiry', businessInquirySchema);

module.exports = BusinessInquiry;
