const mongoose = require('mongoose');

const apiCallLogSchema = new mongoose.Schema({
    apiKeyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ApiKey',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    endpoint: {
        type: String,
        required: true
    },
    method: {
        type: String,
        required: true
    },
    statusCode: {
        type: Number,
        required: true
    },
    responseTime: {
        type: Number,
        required: true
    },
    ipAddress: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for fast analytics queries
apiCallLogSchema.index({ userId: 1, timestamp: -1 });
apiCallLogSchema.index({ apiKeyId: 1, timestamp: -1 });

module.exports = mongoose.model('ApiCallLog', apiCallLogSchema);
