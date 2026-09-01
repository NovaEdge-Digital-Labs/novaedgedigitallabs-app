const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    avatar: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    plan: {
        type: String,
        enum: ['free', 'pro', 'business'],
        default: 'free'
    },
    planExpiry: {
        type: Date,
        default: null
    },
    fcmToken: {
        type: String,
        default: null
    },
    toolUsage: {
        type: Map,
        of: new mongoose.Schema({
            count: { type: Number, default: 0 },
            lastReset: { type: Date, default: Date.now }
        }, { _id: false }),
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // What the user came here to DO. Kept separate from `role`, which is a
    // permission level (user/admin) checked all over the codebase — conflating
    // the two would turn "I'm a freelancer" into a privilege grant.
    // Drives Home cards, Profile menu order and tab visibility.
    personas: {
        type: [{
            type: String,
            enum: ['client', 'freelancer', 'student', 'jobseeker', 'employer']
        }],
        default: []
    },
    bio: {
        type: String,
        default: ''
    },
    skills: {
        type: [String],
        default: []
    },
    hourlyRate: {
        type: Number,
        default: 0
    },
    portfolioUrl: {
        type: String,
        default: ''
    },
    // Gamification & Loyalty
    novaedgeCredits: {
        type: Number,
        default: 0
    },
    lastLoginDate: {
        type: Date,
        default: null
    },
    dailyLoginStreak: {
        type: Number,
        default: 0
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    twoFactorAuthEnabled: {
        type: Boolean,
        default: false
    },
    notificationPreferences: {
        pushEnabled: { type: Boolean, default: true },
        emailEnabled: { type: Boolean, default: true },
        toolUpdates: { type: Boolean, default: true },
        billing: { type: Boolean, default: true },
        security: { type: Boolean, default: true },
        promotions: { type: Boolean, default: false },
        newsletter: { type: Boolean, default: false },
        tips: { type: Boolean, default: true }
    },
    emailOtp: String,
    emailOtpExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to return public JSON
userSchema.methods.toPublicJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.emailOtp;
    delete userObject.emailOtpExpires;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpires;
    // notificationPreferences is returned to allow frontend syncing
    return userObject;
};

module.exports = mongoose.model('User', userSchema);
