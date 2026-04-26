const express = require('express');
const router = express.Router();
const {
    getActiveListings,
    submitInquiry,
    adminManageListing,
    handleWebhook
} = require('../controllers/featuredListing.controller');
const { protect } = require('../middleware/auth.middleware');
const { checkAdmin } = require('../middleware/admin.middleware');

// Public route to get featured listings
router.get('/', getActiveListings);

// Private route to submit business inquiry
router.post('/inquiry', protect, submitInquiry);

// Admin route to manage listings manually
router.post('/admin', protect, checkAdmin, adminManageListing);

// Razorpay Webhook route (should be called by Razorpay)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
