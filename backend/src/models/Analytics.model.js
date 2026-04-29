const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    metrics: {
        avgSessionDuration: Number,
        bounceRate: Number,
        retentionRate: Number,
        activeNodes: Number,
        trafficSources: [{
            label: String,
            value: Number
        }],
        regionalDistribution: [{
            country: String,
            value: String,
            color: String
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
