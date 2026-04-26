const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Project description is required']
    },
    budgetRange: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    deadline: {
        type: Date,
        required: true
    },
    skillsRequired: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'cancelled'],
        default: 'open'
    },
    totalProposals: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
