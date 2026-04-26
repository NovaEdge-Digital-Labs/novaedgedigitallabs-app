const User = require('../models/User.model');
const Course = require('../models/Course.model');
const ToolUsage = require('../models/ToolUsage.model');
const Lead = require('../models/Lead.model');

/**
 * @desc    Get overall system stats for dashboard
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getStats = async (req, res, next) => {
    try {
        const userCount = await User.countDocuments();
        const courseCount = await Course.countDocuments();
        const leadCount = await Lead.countDocuments();

        // Get total tool usage across all users
        const toolUsage = await ToolUsage.aggregate([
            { $group: { _id: null, totalCalls: { $sum: '$dailyCalls' } } }
        ]);

        const totalToolCalls = toolUsage.length > 0 ? toolUsage[0].totalCalls : 0;

        res.status(200).json({
            success: true,
            stats: {
                users: userCount,
                courses: courseCount,
                leads: leadCount,
                totalToolCalls
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users with pagination
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a user's role or plan
 * @route   PUT /api/admin/user/:id
 * @access  Private/Admin
 */
exports.updateUser = async (req, res, next) => {
    try {
        const { role, plan } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (role) user.role = role;
        if (plan) user.plan = plan;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};
