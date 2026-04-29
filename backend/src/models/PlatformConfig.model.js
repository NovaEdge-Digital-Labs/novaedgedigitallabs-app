const mongoose = require('mongoose');

const platformConfigSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: 'NovaEdge Digital Labs',
        trim: true
    },
    supportEmail: {
        type: String,
        default: 'support@novaedge.io',
        trim: true
    },
    description: {
        type: String,
        default: 'The central control unit for NovaEdge Digital Labs infrastructure and cloud services.'
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    defaultLanguage: {
        type: String,
        default: 'English (United States)'
    },
    timezone: {
        type: String,
        default: 'UTC (Coordinated Universal Time)'
    },
    brandPrimaryColor: {
        type: String,
        default: '#8B5CF6'
    },
    colorScheme: {
        type: String,
        enum: ['dark', 'light'],
        default: 'dark'
    },
    typography: {
        type: String,
        default: 'Inter (Modern Sans)'
    },
    allowedDomains: [{
        type: String
    }],
    sslEnabled: {
        type: Boolean,
        default: true
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('PlatformConfig', platformConfigSchema);
