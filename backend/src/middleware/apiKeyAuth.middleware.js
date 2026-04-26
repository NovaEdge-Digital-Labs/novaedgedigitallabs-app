const ApiKey = require('../models/ApiKey.model');
const ApiCallLog = require('../models/ApiCallLog.model');

const apiKeyAuth = async (req, res, next) => {
    const key = req.headers['x-api-key'];

    if (!key) {
        return res.status(401).json({ success: false, message: 'API Key is missing' });
    }

    try {
        const apiKey = await ApiKey.findOne({ key, isActive: true }).populate('userId');

        if (!apiKey) {
            return res.status(401).json({ success: false, message: 'Invalid or inactive API Key' });
        }

        const user = apiKey.userId;

        if (!user || user.plan !== 'business') {
            return res.status(403).json({ success: false, message: 'Developer API is only available for Business plan users' });
        }

        // Check if monthly reset is needed
        const now = new Date();
        const lastReset = new Date(apiKey.lastResetDate);
        if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
            apiKey.monthlyCalls = 0;
            apiKey.lastResetDate = now;
            await apiKey.save();
        }

        // Check quota
        if (apiKey.monthlyCalls >= apiKey.monthlyLimit) {
            return res.status(429).json({
                success: false,
                message: 'Monthly API quota exceeded. Please upgrade or purchase additional packs.'
            });
        }

        // Attach user and apiKey info to request for controllers and logging
        req.user = user;
        // Normalize for existing controllers
        req.user.id = user._id;
        req.apiKey = apiKey;

        // Capture start time for response time tracking
        const startTime = Date.now();

        // Process requested tools
        res.on('finish', async () => {
            try {
                const responseTime = Date.now() - startTime;

                // Increment call count
                await ApiKey.findByIdAndUpdate(apiKey._id, {
                    $inc: { totalCalls: 1, monthlyCalls: 1 }
                });

                // Log the call
                await ApiCallLog.create({
                    apiKeyId: apiKey._id,
                    userId: user._id,
                    endpoint: req.originalUrl,
                    method: req.method,
                    statusCode: res.statusCode,
                    responseTime,
                    ipAddress: req.ip
                });
            } catch (err) {
                console.error('Error logging API call:', err);
            }
        });

        next();
    } catch (error) {
        console.error('API Auth Error:', error);
        res.status(500).json({ success: false, message: 'Server error during API authentication' });
    }
};

module.exports = apiKeyAuth;
