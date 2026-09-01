const PremiumJobSeeker = require('../models/PremiumJobSeeker.model');
const PricingTier = require('../models/PricingTier.model');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

const DEFAULT_PASS_PRICE = 499; // rupees — must match the PremiumUpgradeScreen fallback

// Single source of truth for the pass price. The client reads the same tier via
// GET /jobs/pricing, so the price shown and the price charged cannot drift apart.
const resolvePassTier = async () => {
    const tier = await PricingTier.findOne({
        isActive: true,
        $or: [{ category: 'seeker_membership' }, { tierId: 'ProSeeker' }]
    });

    return {
        name: (tier && tier.name) || 'Premium Candidate Pass',
        price: (tier && tier.price) || DEFAULT_PASS_PRICE,
        durationDays: (tier && tier.durationDays) || 30
    };
};

exports.createPremiumOrder = async (req, res) => {
    try {
        const tier = await resolvePassTier();

        const options = {
            amount: Math.round(tier.price * 100), // in paise
            currency: 'INR',
            receipt: `premium_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            price: tier.price,
            name: tier.name,
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

        const tier = await resolvePassTier();

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + tier.durationDays);

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
                        name: tier.name,
                        price: tier.price,
                        billingCycle: `${tier.durationDays} days`
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
