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
    themeConfig: {
        preset: { type: String, default: 'nova-slate' },
        primary: { type: String, default: '#6E56CF' },
        primaryDark: { type: String, default: '#5B45B0' },
        secondary: { type: String, default: '#1A1D23' },
        background: { type: String, default: '#0A0B0D' },
        accent: { type: String, default: '#9E8CFC' },
        glow: { type: String, default: '#6E56CF' },
        primaryGradient: { type: String, default: 'linear-gradient(135deg, #6E56CF, #5B45B0)' },
        backgroundGradient: { type: String, default: 'linear-gradient(180deg, #0C0D11, #0A0B0D)' },
        text: { type: String, default: '#EDEEF0' },
        textLight: { type: String, default: '#B4B8BF' },
        textMuted: { type: String, default: '#8B909A' },
        card: { type: String, default: '#101216' },
        border: { type: String, default: 'rgba(255, 255, 255, 0.09)' }
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
