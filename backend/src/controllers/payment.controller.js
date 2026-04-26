const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Subscription = require('../models/Subscription.model');
const User = require('../models/User.model');
const PRICING = require('../constants/pricing');

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/payment/create-order
 * @access  Private
 */
exports.createOrder = async (req, res, next) => {
    try {
        const { plan, billingCycle } = req.body;

        if (!plan || !billingCycle || !PRICING[plan] || !PRICING[plan][billingCycle]) {
            return res.status(400).json({ success: false, message: 'Invalid plan or billing cycle' });
        }

        const amount = PRICING[plan][billingCycle];
        const options = {
            amount: amount, // in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Save pending subscription
        await Subscription.create({
            userId: req.user.id,
            plan,
            billingCycle,
            amount,
            razorpayOrderId: order.id,
            status: 'pending'
        });

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify Razorpay Payment
 * @route   POST /api/payment/verify
 * @access  Private
 */
exports.verifyPayment = async (req, res, next) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan, billingCycle } = req.body;

        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        // Update subscription
        const endDate = new Date();
        if (billingCycle === 'monthly') {
            endDate.setDate(endDate.getDate() + 30);
        } else {
            endDate.setDate(endDate.getDate() + 365);
        }

        const subscription = await Subscription.findOneAndUpdate(
            { razorpayOrderId },
            {
                razorpayPaymentId,
                razorpaySignature,
                status: 'active',
                startDate: new Date(),
                endDate: endDate
            },
            { new: true }
        );

        // Update User plan details
        await User.findByIdAndUpdate(req.user.id, {
            plan: plan,
            planExpiry: endDate
        });

        res.status(200).json({
            success: true,
            message: 'Subscription activated',
            subscription
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Payment History
 * @route   GET /api/payment/history
 * @access  Private
 */
exports.getPaymentHistory = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find({ userId: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel Subscription
 * @route   POST /api/payment/cancel
 * @access  Private
 */
exports.cancelSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findOne({
            userId: req.user.id,
            status: 'active'
        });

        if (!subscription) {
            return res.status(404).json({ success: false, message: 'No active subscription found' });
        }

        subscription.status = 'cancelled';
        await subscription.save();

        res.status(200).json({
            success: true,
            message: 'Cancelled. Access until planExpiry'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Handle Razorpay Webhook
 * @route   POST /api/payment/webhook
 * @access  Public
 */
exports.handleWebhook = async (req, res, next) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).send('Invalid signature');
        }

        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'payment.captured') {
            const paymentId = payload.payment.entity.id;
            const orderId = payload.payment.entity.order_id;

            const subscription = await Subscription.findOne({ razorpayOrderId: orderId });
            if (subscription && subscription.status === 'pending') {
                subscription.status = 'active';
                subscription.razorpayPaymentId = paymentId;
                subscription.startDate = new Date();

                const endDate = new Date();
                if (subscription.billingCycle === 'monthly') {
                    endDate.setDate(endDate.getDate() + 30);
                } else {
                    endDate.setDate(endDate.getDate() + 365);
                }
                subscription.endDate = endDate;
                await subscription.save();

                // Update User
                await User.findByIdAndUpdate(subscription.userId, {
                    plan: subscription.plan,
                    planExpiry: endDate
                });
            }
        } else if (event === 'subscription.cancelled') {
            // Handle Razorpay specific subscription cancellation if needed
            // Currently using custom logic in cancelSubscription
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(200).json({ status: 'ok' }); // Always return 200
    }
};
