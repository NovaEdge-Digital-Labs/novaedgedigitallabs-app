const PremiumJobSeeker = require('../models/PremiumJobSeeker.model');
const PaymentOrder = require('../models/PaymentOrder.model');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const { verifySignature, assertOrderPaid, addMonths } = require('../utils/payments');

const PREMIUM_PASS_PAISE = 199 * 100;

exports.createPremiumOrder = async (req, res) => {
    try {
        const options = {
            amount: PREMIUM_PASS_PAISE, // in paise
            currency: 'INR',
            receipt: `premium_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Record who this order belongs to and what it should cost. Verification
        // binds against this rather than trusting anything from the client.
        await PaymentOrder.create({
            userId: req.user.id,
            purpose: 'premium_seeker',
            amount: options.amount,
            currency: options.currency,
            razorpayOrderId: order.id,
            status: 'pending'
        });

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

        if (!verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        // Bind to this user's own pending order. Previously any valid signature
        // activated the caller's pass, so one payment could be replayed across
        // accounts and repeatedly to extend the term.
        const order = await PaymentOrder.findOne({
            razorpayOrderId,
            userId: req.user.id,
            purpose: 'premium_seeker',
            status: 'pending'
        });

        if (!order) {
            return res.status(409).json({ success: false, message: 'No pending order found for this payment' });
        }

        const paid = await assertOrderPaid(razorpayOrderId, order.amount);
        if (!paid.ok) {
            return res.status(400).json({ success: false, message: paid.reason });
        }

        const consumed = await PaymentOrder.findOneAndUpdate(
            { _id: order._id, status: 'pending' },
            { status: 'paid', razorpayPaymentId, consumedAt: new Date() },
            { new: true }
        );

        if (!consumed) {
            return res.status(409).json({ success: false, message: 'This payment was already processed' });
        }

        // Extend from the current expiry when the pass is still live, so paying
        // again tops up rather than truncating the remaining term.
        const existing = await PremiumJobSeeker.findOne({ userId: req.user.id });
        const base =
            existing && existing.status === 'active' && existing.expiryDate > new Date()
                ? existing.expiryDate
                : new Date();
        const expiryDate = addMonths(base, 1);

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

        // Send Invoice Email with CC to app@novaedgedigitallabs.in & BCC to amitkumarraikwar27@gmail.com
        try {
            const User = require('../models/User.model');
            const sendInvoice = require('../utils/sendInvoice');
            const user = await User.findById(req.user.id);
            if (user) {
                await sendInvoice({
                    user: { name: user.name, email: user.email },
                    purchaseType: 'subscription',
                    itemDetails: {
                        name: 'Premium Candidate Pass',
                        price: 499,
                        billingCycle: 'Monthly'
                    },
                    paymentDetails: {
                        orderId: razorpayOrderId || `PREMIUM_${Date.now()}`,
                        paymentId: razorpayPaymentId || `PAY_${Date.now()}`,
                        date: new Date()
                    }
                });
            }
        } catch (mailErr) {
            console.error('Failed to send invoice email for Premium Candidate Pass:', mailErr);
        }

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
