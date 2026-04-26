const AffiliateLink = require('../models/AffiliateLink.model');
const AffiliateClick = require('../models/AffiliateClick.model');

// @desc    Get all active affiliate links
// @route   GET /api/affiliate/links
// @access  Public
exports.getAffiliateLinks = async (req, res) => {
    try {
        const links = await AffiliateLink.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: links
        });
    } catch (error) {
        res.status(500).json({
            success: true,
            message: error.message
        });
    }
};

// @desc    Track an affiliate link click
// @route   POST /api/affiliate/track
// @access  Public
exports.trackAffiliateClick = async (req, res) => {
    try {
        const { linkId, platform } = req.body;

        const link = await AffiliateLink.findById(linkId);
        if (!link) {
            return res.status(404).json({
                success: false,
                message: 'Affiliate link not found'
            });
        }

        await AffiliateClick.create({
            user: req.user ? req.user._id : null,
            link: linkId,
            serviceName: link.name,
            platform: platform || 'other'
        });

        res.status(201).json({
            success: true,
            message: 'Click tracked successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add a new affiliate link (Admin)
// @route   POST /api/affiliate/admin/add
// @access  Private/Admin
exports.addAffiliateLink = async (req, res) => {
    try {
        const link = await AffiliateLink.create(req.body);
        res.status(201).json({
            success: true,
            data: link
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
