const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    gigId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig'
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    platformCommission: {
        type: Number,
        default: 0
    },
    freelancerPayout: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'disputed', 'cancelled'],
        default: 'active'
    },
    escrowStatus: {
        type: String,
        enum: ['pending', 'funded', 'released', 'refunded'],
        default: 'pending'
    },
    workSubmission: {
        content: String,
        fileUrl: String,
        submittedAt: Date
    },
    completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);
