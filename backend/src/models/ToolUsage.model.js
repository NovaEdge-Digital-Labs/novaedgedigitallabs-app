const mongoose = require('mongoose');

const toolUsageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toolName: {
        type: String,
        required: true
    },
    usageCount: {
        type: Number,
        default: 0
    },
    lastResetDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Compound index for fast lookups
toolUsageSchema.index({ userId: 1, toolName: 1 });

module.exports = mongoose.model('ToolUsage', toolUsageSchema);
