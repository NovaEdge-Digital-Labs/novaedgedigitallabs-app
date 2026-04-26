const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ToolUsage = require('../models/ToolUsage.model');
const Subscription = require('../models/Subscription.model');

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, plan: user.plan, role: user.role || 'user' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Check for existing user
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user
        const adminEmail = process.env.ADMIN_EMAIL || 'novaedgedigitallabs@gmail.com';
        const user = await User.create({
            name,
            email,
            password,
            role: email === adminEmail ? 'admin' : 'user'
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            token,
            user: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check user
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            console.log(`Login failed for: ${email} - ${!user ? 'User not found' : 'Invalid password'}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log(`Login successful: ${email}`);

        // Double check admin role for the master email
        const adminEmail = process.env.ADMIN_EMAIL || 'novaedgedigitallabs@gmail.com';
        if (user.email === adminEmail && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            token,
            user: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
    try {
        // req.user is set by protect middleware
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update FCM Token for notifications
 * @route   PATCH /api/auth/fcm-token
 * @access  Private
 */
exports.updateFCMToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;

        if (!fcmToken) {
            return res.status(400).json({
                success: false,
                message: 'FCM Token is required'
            });
        }

        await User.findByIdAndUpdate(req.user.id, { fcmToken });

        res.status(200).json({
            success: true,
            message: 'FCM Token updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete user account and all associated data
 * @route   DELETE /api/auth/delete-account
 * @access  Private
 */
exports.deleteAccount = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to confirm account deletion'
            });
        }

        // Find user with password field
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password. Account deletion cancelled.'
            });
        }

        // Delete all related data
        await ToolUsage.deleteMany({ user: user._id });
        await Subscription.deleteMany({ user: user._id });

        // Delete the user
        await User.findByIdAndDelete(user._id);

        res.status(200).json({
            success: true,
            message: 'Your account and all associated data have been permanently deleted.'
        });
    } catch (error) {
        next(error);
    }
};
