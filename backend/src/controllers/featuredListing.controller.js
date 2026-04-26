const FeaturedListing = require('../models/FeaturedListing.model');
const BusinessInquiry = require('../models/BusinessInquiry.model');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Get top 5 active featured listings
// @route   GET /api/featured
// @access  Public
exports.getActiveListings = async (req, res) => {
    try {
        const now = new Date();
        const listings = await FeaturedListing.find({
            status: 'active',
            expiryDate: { $gt: now }
        }).sort({ slotNumber: 1 }).limit(5);

        res.status(200).json({
            success: true,
            data: listings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit business inquiry for featured slot
// @route   POST /api/featured/inquiry
// @access  Private
exports.submitInquiry = async (req, res) => {
    try {
        const { businessName, ownerName, email, phone, category, message } = req.body;

        const inquiry = await BusinessInquiry.create({
            businessName,
            ownerName,
            email,
            phone,
            category,
            message
        });

        // TODO: Send email notification to admin
        // For now, we simulate success
        console.log(`New Inquiry from ${businessName}. Email: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Inquiry submitted successfully. We will contact you soon.',
            data: inquiry
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Admin: Create/Update a featured listing
// @route   POST /api/featured/admin
// @access  Admin
exports.adminManageListing = async (req, res) => {
    try {
        const { businessName, logo, description, contactNumber, websiteUrl, slotNumber, subscriptionId, expiryDate } = req.body;

        // Check if slot is already occupied
        const existing = await FeaturedListing.findOne({ slotNumber, status: 'active' });
        if (existing && existing.subscriptionId !== subscriptionId) {
            return res.status(400).json({ success: false, message: `Slot ${slotNumber} is already occupied.` });
        }

        const listing = await FeaturedListing.findOneAndUpdate(
            { slotNumber },
            {
                businessName,
                logo,
                description,
                contactNumber,
                websiteUrl,
                subscriptionId,
                expiryDate,
                status: 'active'
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            data: listing
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Handle Razorpay Webhook for Subscriptions
exports.handleWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // In a real production app, verify signature here (omitted for brevity in this task)
    const event = req.body.event;
    const payload = req.body.payload;

    try {
        if (event === 'subscription.cancelled' || event === 'subscription.halted') {
            const subId = payload.subscription.entity.id;
            await FeaturedListing.findOneAndUpdate(
                { subscriptionId: subId },
                { status: 'inactive' }
            );
        } else if (event === 'subscription.charged') {
            const subId = payload.subscription.entity.id;
            const nextBilling = new Date(payload.subscription.entity.current_end * 1000);
            await FeaturedListing.findOneAndUpdate(
                { subscriptionId: subId },
                { status: 'active', expiryDate: nextBilling }
            );
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Webhook failed');
    }
};
