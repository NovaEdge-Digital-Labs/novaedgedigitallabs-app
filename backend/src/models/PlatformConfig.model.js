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
        preset: { type: String, default: 'purple-cyber' },
        primary: { type: String, default: '#9127FF' },
        primaryDark: { type: String, default: '#7B00FF' },
        secondary: { type: String, default: '#120025' },
        background: { type: String, default: '#06000F' },
        accent: { type: String, default: '#C042FF' },
        glow: { type: String, default: '#9127FF' },
        primaryGradient: { type: String, default: 'linear-gradient(135deg, #9127FF, #C042FF)' },
        backgroundGradient: { type: String, default: 'radial-gradient(circle at top left, #2D006D, #06000F)' },
        text: { type: String, default: '#FFFFFF' },
        textLight: { type: String, default: '#E0E0FF' },
        textMuted: { type: String, default: '#A080FF' },
        card: { type: String, default: 'rgba(255, 255, 255, 0.03)' },
        border: { type: String, default: 'rgba(145, 39, 255, 0.2)' }
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
