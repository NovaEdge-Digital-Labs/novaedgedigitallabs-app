/**
 * Middleware to check if user is admin
 */
const checkAdmin = (req, res, next) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'novaedgedigitallabs@gmail.com';

    if (req.user && req.user.email === adminEmail) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

module.exports = { checkAdmin };
