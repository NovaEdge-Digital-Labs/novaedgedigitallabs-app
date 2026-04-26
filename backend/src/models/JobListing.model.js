const mongoose = require('mongoose');

const jobListingSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompanyProfile',
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Remote', 'Internship'],
        required: true
    },
    salaryRange: {
        min: { type: Number },
        max: { type: Number }
    },
    requiredSkills: [String],
    experienceLevel: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: [true, 'Job description is required']
    },
    listingType: {
        type: String,
        enum: ['Basic', 'Featured', 'Premium'],
        default: 'Basic'
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    razorpayOrderId: String,
    razorpayPaymentId: String
}, { timestamps: true });

// Index for search functionality
jobListingSchema.index({ title: 'text', requiredSkills: 'text' });

module.exports = mongoose.model('JobListing', jobListingSchema);
