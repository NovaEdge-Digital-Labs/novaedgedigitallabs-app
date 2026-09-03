const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Fields the request pipeline reads off req.user. Kept narrow so the extra
// lookup stays cheap on every authenticated request.
const USER_FIELDS = '_id email name plan planExpiry role isActive';

/**
 * Resolve the token payload against the database.
 *
 * The JWT carries a *snapshot* of plan/role taken at login. Trusting that
 * snapshot meant a user promoted to admin (or upgraded to pro) kept being
 * treated as their old self until the token expired — the admin screens showed
 * the tile but every /api/admin call came back 403. Always read the live row.
 */
const resolveUser = async (decoded) => {
    const user = await User.findById(decoded.id).select(USER_FIELDS).lean();
    if (!user) return null;

    return {
        id: user._id.toString(),
        _id: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        planExpiry: user.planExpiry,
        role: user.role || 'user',
        isActive: user.isActive
    };
};

const protect = async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer')) {
        return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    let decoded;
    try {
        decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
    }

    try {
        const user = await resolveUser(decoded);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Account no longer exists. Please log in again.' });
        }

        if (user.isActive === false) {
            return res.status(403).json({ success: false, message: 'This account has been deactivated.' });
        }

        req.user = user;
        return next();
    } catch (error) {
        return next(error);
    }
};

const optionalAuth = async (req, res, next) => {
    const header = req.headers.authorization;

    if (header && header.startsWith('Bearer')) {
        try {
            const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
            const user = await resolveUser(decoded);
            if (user && user.isActive !== false) req.user = user;
        } catch (error) {
            // Silently fail, user simply won't be in req.user
        }
    }

    next();
};

module.exports = { protect, optionalAuth };
