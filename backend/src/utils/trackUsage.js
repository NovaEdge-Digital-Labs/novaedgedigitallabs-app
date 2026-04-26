const ToolUsage = require('../models/ToolUsage.model');

/**
 * Utility to track and limit tool usage based on user plan
 * @param {String} userId - The user ID
 * @param {String} toolName - Name of the tool (e.g., 'compress', 'qr', 'invoice')
 * @param {Number} limit - Max daily usage (-1 for unlimited)
 * @returns {Object} Updated usage record
 */
const trackUsage = async (userId, toolName, limit) => {
    let usage = await ToolUsage.findOne({ userId, toolName });

    if (!usage) {
        usage = await ToolUsage.create({ userId, toolName });
    }

    const today = new Date();
    const lastReset = new Date(usage.lastResetDate);

    // Check if reset is needed (daily reset)
    if (today.toDateString() !== lastReset.toDateString()) {
        usage.usageCount = 0;
        usage.lastResetDate = today;
    }

    // Check limit
    if (limit !== -1 && usage.usageCount >= limit) {
        throw new Error(`Daily limit reached for ${toolName}. Limit is ${limit} per day.`);
    }

    // Increment and save
    usage.usageCount += 1;
    await usage.save();

    return usage;
};

module.exports = trackUsage;
