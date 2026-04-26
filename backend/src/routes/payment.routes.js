const express = require('express');
const router = express.Router();
const {
    createOrder,
    verifyPayment,
    getPaymentHistory,
    cancelSubscription,
    handleWebhook
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.post('/cancel', protect, cancelSubscription);
router.post('/webhook', handleWebhook);

module.exports = router;
