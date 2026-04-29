const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Service title is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        maxlength: 200
    },
    description: {
        type: String,
        required: [true, 'Full description is required']
    },
    icon: {
        type: String,
        default: 'Code' // Lucide icon name
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['web-development', 'app-development', 'ui-ux-design', 'cloud-devops', 'ai-ml', 'digital-marketing', 'consulting', 'other']
    },
    pricing: {
        startingPrice: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' },
        model: {
            type: String,
            enum: ['fixed', 'hourly', 'project-based', 'custom'],
            default: 'project-based'
        }
    },
    features: [String],
    technologies: [String],
    deliverables: [String],
    thumbnail: String,
    gallery: [String],
    estimatedDuration: {
        type: String, // e.g., "2-4 weeks"
        default: 'Custom'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Auto-generate slug from title
serviceSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('Service', serviceSchema);
