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
        preset: { type: String, default: 'nova-web' },
        primary: { type: String, default: '#ac4bff' },
        primaryDark: { type: String, default: '#8200da' },
        secondary: { type: String, default: '#3c0366' },
        background: { type: String, default: '#070010' },
        accent: { type: String, default: '#c07eff' },
        glow: { type: String, default: '#ac4bff' },
        primaryGradient: { type: String, default: 'linear-gradient(135deg, #ac4bff, #9810fa)' },
        backgroundGradient: { type: String, default: 'radial-gradient(circle at top left, #3c0366, #070010)' },
        text: { type: String, default: '#FFFFFF' },
        textLight: { type: String, default: '#d1d5dc' },
        textMuted: { type: String, default: '#99a1af' },
        card: { type: String, default: 'rgba(17, 24, 39, 0.5)' },
        border: { type: String, default: 'rgba(172, 75, 255, 0.2)' }
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
