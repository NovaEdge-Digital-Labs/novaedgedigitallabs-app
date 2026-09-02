const mongoose = require('mongoose');

const appConfigSchema = new mongoose.Schema({
    isMaintenanceMode: {
        type: Boolean,
        default: false
    },
    minimumAppVersion: {
        type: String,
        default: '1.0.0'
    },
    supportEmail: {
        type: String,
        default: 'support@novaedgedigitallabs.tech'
    },
    websiteUrl: {
        type: String,
        default: 'https://novaedgedigitallabs.tech'
    },
    appDownloadLink: {
        type: String,
        default: 'https://play.google.com/store/apps/details?id=in.novaedgedigitallabs.tech'
    },
    socialLinks: {
        github: { type: String, default: 'https://github.com/novaedge' },
        linkedin: { type: String, default: 'https://linkedin.com/company/novaedge' },
        instagram: { type: String, default: 'https://instagram.com/novaedge' },
        portfolio: { type: String, default: 'https://novaedgedigitallabs.tech' }
    },
    defaultImage: {
        type: String,
        default: 'https://novaedgedigitallabs.tech/logo.png'
    },
    defaultBlogImage: {
        type: String,
        default: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80'
    },
    referralMessage: {
        type: String,
        default: 'Join NovaEdge Digital Labs and get premium tools for FREE! Use my referral code: {CODE}\n\nDownload now: {LINK}'
    },
    apiProPlanPrice: {
        type: Number,
        default: 499
    },
    apiProPlanQuota: {
        type: Number,
        default: 50000
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AppConfig', appConfigSchema);
