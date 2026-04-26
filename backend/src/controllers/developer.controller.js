const ApiKey = require('../models/ApiKey.model');
const ApiCallLog = require('../models/ApiCallLog.model');
const User = require('../models/User.model');

/**
 * @desc    Get current API key for the user
 * @route   GET /api/developer/key
 * @access  Private (Business)
 */
exports.getApiKey = async (req, res, next) => {
    try {
        let apiKey = await ApiKey.findOne({ userId: req.user.id, isActive: true });

        // If user is business and has no key, generate one automatically
        if (!apiKey && req.user.plan === 'business') {
            apiKey = await ApiKey.create({
                userId: req.user.id,
                key: ApiKey.generateKey()
            });
        }

        if (!apiKey) {
            return res.status(404).json({ success: false, message: 'No API Key found or not eligible' });
        }

        res.status(200).json({
            success: true,
            apiKey: apiKey.key,
            quota: {
                used: apiKey.monthlyCalls,
                limit: apiKey.monthlyLimit
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Regenerate API key
 * @route   POST /api/developer/key/regenerate
 * @access  Private (Business)
 */
exports.regenerateApiKey = async (req, res, next) => {
    try {
        if (req.user.plan !== 'business') {
            return res.status(403).json({ success: false, message: 'Developer API is for Business plan only' });
        }

        // Deactivate current key
        await ApiKey.updateMany({ userId: req.user.id }, { isActive: false });

        // Create new key
        const newKey = await ApiKey.create({
            userId: req.user.id,
            key: ApiKey.generateKey()
        });

        res.status(201).json({
            success: true,
            apiKey: newKey.key,
            message: 'API Key regenerated successfully. Old keys are now inactive.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get API usage analytics
 * @route   GET /api/developer/stats
 * @access  Private (Business)
 */
exports.getApiUsageStats = async (req, res, next) => {
    try {
        const apiKey = await ApiKey.findOne({ userId: req.user.id, isActive: true });
        if (!apiKey) {
            return res.status(404).json({ success: false, message: 'No active API Key' });
        }

        // Breakdown by tool (endpoint)
        const stats = await ApiCallLog.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: '$endpoint',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Recent call history
        const history = await ApiCallLog.find({ userId: req.user.id })
            .sort({ timestamp: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            stats: {
                monthlyCalls: apiKey.monthlyCalls,
                monthlyLimit: apiKey.monthlyLimit,
                totalCalls: apiKey.totalCalls,
                toolBreakdown: stats
            },
            history
        });
    } catch (error) {
        next(error);
    }
};
