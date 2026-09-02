const express = require('express');
const router = express.Router();
const {
    getApiKey,
    regenerateApiKey,
    getApiUsageStats,
    createSubscriptionOrder,
    verifyPayment,
    renderCheckout
} = require('../controllers/developer.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/key', protect, getApiKey);
router.post('/key/regenerate', protect, regenerateApiKey);
router.get('/stats', protect, getApiUsageStats);
router.post('/subscribe', protect, createSubscriptionOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/checkout/:orderId', renderCheckout);

module.exports = router;
