const User = require('../models/User.model');

/**
 * Middleware to check if user has the required plan or higher
 * @param {String} requiredPlan - 'free', 'pro', or 'business'
 */
const checkPlan = (requiredPlan) => {
    const planHierarchy = {
        'free': 0,
        'pro': 1,
        'business': 2
    };

    return async (req, res, next) => {
        try {
            // User should be already authenticated via 'protect' middleware
            // req.user contains { id, email, plan }

            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Check if plan is expired
            if (user.planExpiry && new Date() > user.planExpiry) {
                user.plan = 'free';
                user.planExpiry = null;
                await user.save();
                req.user.plan = 'free'; // Update req.user for current request
            }

            const userPlanLevel = planHierarchy[user.plan] || 0;
            const requiredPlanLevel = planHierarchy[requiredPlan] || 0;

            if (userPlanLevel < requiredPlanLevel) {
                return res.status(403).json({
                    success: false,
                    message: `This feature is only available for ${requiredPlan} plans or higher. Please upgrade your plan.`
                });
            }

            next();
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error check plan' });
        }
    };
};

module.exports = checkPlan;
