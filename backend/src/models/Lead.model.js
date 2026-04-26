const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    service: {
        type: String,
        enum: ['web-development', 'app-development', 'seo', 'ui-ux', 'other'],
        required: true
    },
    budget: {
        type: String,
        enum: ['under-20k', '20k-50k', '50k-2L', 'above-2L']
    },
    message: {
        type: String,
        required: true
    },
    source: {
        type: String,
        default: 'app'
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'in-progress', 'closed-won', 'closed-lost'],
        default: 'new'
    },
    assignedTo: {
        type: String,
        default: 'Amit'
    },
    notes: {
        type: String,
        default: ''
    },
    // For quote requests
    projectType: String,
    deadline: String,
    hasExistingDesign: Boolean,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
