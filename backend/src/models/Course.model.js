const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: {
        name: { type: String, required: true },
        bio: String,
        avatar: String
    },
    // In RUPEES. Razorpay orders convert to paise at order-creation time
    // (see course.controller.js -> enrollInCourse: `amount: course.price * 100`).
    // Do NOT store paise here or users will be charged 100x.
    price: { type: Number, required: true },
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
    outcomes: [String],
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
        default: 'All Levels'
    },
    language: {
        type: String,
        default: 'Hindi / English'
    },
    hasCertificate: {
        type: Boolean,
        default: true
    },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
