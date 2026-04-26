const rateLimit = require('express-rate-limit');

/**
 * @desc Rate limit for Lead submissions (Contact Us / Get Quote)
 * Limit: 5 requests per IP per hour
 */
exports.leadRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        message: 'Too many lead submissions from this IP, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * @desc Rate limit for Tools API
 * Limit: 100 requests per IP per 15 minutes
 */
exports.toolsRateLimit = rateLimit({
    windowMs: 15 * 1000 * 60, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Too many requests to tool services. Please slow down.'
    }
});

/**
 * @desc Rate limit for Auth endpoints
 * Limit: 10 requests per IP per 15 minutes
 */
exports.authRateLimit = rateLimit({
    windowMs: 15 * 1000 * 60, // 15 minutes
    max: 10,
    message: {
        success: false,
        message: 'Too many login/register attempts. Please try again after 15 minutes.'
    }
});
