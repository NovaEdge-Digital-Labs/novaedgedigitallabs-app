const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverLetter: {
        type: String,
        required: true
    },
    bidAmount: {
        type: Number,
        required: true
    },
    deliveryDays: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
    }
}, { timestamps: true });

// Ensure unique proposal per freelancer per project
proposalSchema.index({ projectId: 1, freelancerId: 1 }, { unique: true });

module.exports = mongoose.model('Proposal', proposalSchema);
