import mongoose from 'mongoose';

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

export const Analytics = mongoose.model('Analytics', analyticsSchema);
