const express = require('express');
const router = express.Router();
const { getAffiliateLinks, trackAffiliateClick, addAffiliateLink } = require('../controllers/affiliate.controller');
const { protect } = require('../middleware/auth.middleware');
const { checkAdmin } = require('../middleware/admin.middleware');

// Track clicks - non-blocking auth (if user is there, log it, otherwise log as guest)
const optionalAuth = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return protect(req, res, next);
    }
    next();
};

router.get('/links', getAffiliateLinks);
router.post('/track', optionalAuth, trackAffiliateClick);
router.post('/admin/add', protect, checkAdmin, addAffiliateLink);

module.exports = router;
