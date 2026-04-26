const PremiumJobSeeker = require('../models/PremiumJobSeeker.model');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

exports.createPremiumOrder = async (req, res) => {
    try {
        const options = {
            amount: 199 * 100, // ₹199 in paise
            currency: 'INR',
            receipt: `premium_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyPremium = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const premium = await PremiumJobSeeker.findOneAndUpdate(
            { userId: req.user.id },
            {
                expiryDate,
                status: 'active',
                razorpayOrderId,
                razorpayPaymentId
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: premium });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPremiumStatus = async (req, res) => {
    try {
        const premium = await PremiumJobSeeker.findOne({ userId: req.user.id });
        res.status(200).json({
            success: true,
            isPremium: premium && premium.status === 'active' && premium.expiryDate > new Date(),
            data: premium
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
