const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    key: {
        type: String,
        required: true,
        unique: true
    },
    totalCalls: {
        type: Number,
        default: 0
    },
    monthlyCalls: {
        type: Number,
        default: 0
    },
    monthlyLimit: {
        type: Number,
        default: 5000
    },
    lastResetDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Method to generate a random API key
apiKeySchema.statics.generateKey = function () {
    return 'ne_' + crypto.randomBytes(24).toString('hex');
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
