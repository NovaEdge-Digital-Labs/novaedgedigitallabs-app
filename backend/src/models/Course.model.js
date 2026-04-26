const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: {
        name: { type: String, required: true },
        bio: String,
        avatar: String
    },
    price: { type: Number, required: true }, // in Paisa
    originalPrice: Number,
    category: {
        type: String,
        enum: ['Web Development', 'App Development', 'Freelancing', 'Design', 'Marketing'],
        required: true
    },
    thumbnail: { type: String, required: true },
    previewVideoUrl: String,
    lectures: [{
        title: { type: String, required: true },
        duration: String, // e.g. "10:30"
        videoUrl: { type: String, required: true },
        freePreview: { type: Boolean, default: false }
    }],
    totalDuration: String,
    enrolledCount: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    tags: [String],
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
