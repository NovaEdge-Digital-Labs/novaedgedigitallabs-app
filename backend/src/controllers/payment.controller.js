const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const {
    verifySignature,
    verifyWebhookSignature,
    assertOrderPaid,
    termEnd,
} = require('../utils/payments');
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
        // `plan` and `billingCycle` are deliberately NOT read from the body.
        // The signature only attests to the order/payment pair, so trusting
        // body-supplied plan details let a caller pay for the cheapest plan
        // and activate the most expensive one.
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        if (!verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        // The order must belong to the caller and still be awaiting payment.
        // Scoping by userId stops one payment being replayed onto other
        // accounts; requiring 'pending' stops the same payment being replayed
        // onto this one to extend the term indefinitely.
        const pending = await Subscription.findOne({
            razorpayOrderId,
            userId: req.user.id,
            status: 'pending'
        });

        if (!pending) {
            return res.status(409).json({
                success: false,
                message: 'No pending order found for this payment'
            });
        }

        const paid = await assertOrderPaid(razorpayOrderId, pending.amount);
        if (!paid.ok) {
            return res.status(400).json({ success: false, message: paid.reason });
        }

        const startDate = new Date();
        const endDate = termEnd(pending.billingCycle, startDate);

        // Conditional update doubles as the replay guard: a concurrent second
        // request finds status already 'active' and matches nothing.
        const subscription = await Subscription.findOneAndUpdate(
            { _id: pending._id, status: 'pending' },
            {
                razorpayPaymentId,
                razorpaySignature,
                status: 'active',
                startDate,
                endDate
            },
            { new: true }
        );

        if (!subscription) {
            return res.status(409).json({ success: false, message: 'This payment was already processed' });
        }

        // Plan comes from the stored order, not the request.
        const user = await User.findByIdAndUpdate(req.user.id, {
            plan: subscription.plan,
            planExpiry: endDate
        }, { new: true });

        // Send Email Invoice
        try {
            const sendInvoice = require('../utils/sendInvoice');
            await sendInvoice({
                user: {
                    name: user.name,
                    email: user.email
                },
                purchaseType: 'subscription',
                itemDetails: {
                    name: subscription.plan,
                    price: subscription.amount,
                    billingCycle: subscription.billingCycle
                },
                paymentDetails: {
                    orderId: razorpayOrderId,
                    paymentId: razorpayPaymentId,
                    date: subscription.startDate
                }
            });
        } catch (mailError) {
            console.error('Failed to send invoice email:', mailError);
        }

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
    // req.body is a Buffer here: server.js mounts express.raw() for this route
    // ahead of express.json(). Razorpay signs the exact bytes it sent, and
    // re-serializing a parsed object is not guaranteed to reproduce them.
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const signature = req.headers['x-razorpay-signature'];

    if (!verifyWebhookSignature(rawBody, signature)) {
        // A bad signature will never become good, so don't invite a retry.
        return res.status(400).send('Invalid signature');
    }

    let parsed;
    try {
        parsed = JSON.parse(rawBody.toString('utf8'));
    } catch (err) {
        return res.status(400).send('Malformed payload');
    }

    try {
        const event = parsed.event;
        const payload = parsed.payload;

        if (event === 'payment.captured') {
            const paymentId = payload.payment.entity.id;
            const orderId = payload.payment.entity.order_id;

            const subscription = await Subscription.findOne({ razorpayOrderId: orderId });

            if (subscription && subscription.status === 'pending') {
                const startDate = new Date();
                const endDate = termEnd(subscription.billingCycle, startDate);

                // Conditional update keeps this idempotent: Razorpay retries
                // deliveries, and the checkout callback may land first.
                const activated = await Subscription.findOneAndUpdate(
                    { _id: subscription._id, status: 'pending' },
                    { status: 'active', razorpayPaymentId: paymentId, startDate, endDate },
                    { new: true }
                );

                if (activated) {
                    const user = await User.findByIdAndUpdate(activated.userId, {
                        plan: activated.plan,
                        planExpiry: endDate
                    }, { new: true });

                    try {
                        const sendInvoice = require('../utils/sendInvoice');
                        await sendInvoice({
                            user: { name: user.name, email: user.email },
                            purchaseType: 'subscription',
                            itemDetails: {
                                name: activated.plan,
                                price: activated.amount,
                                billingCycle: activated.billingCycle
                            },
                            paymentDetails: { orderId, paymentId, date: activated.startDate }
                        });
                    } catch (mailError) {
                        console.error('Failed to send webhook invoice email:', mailError);
                    }
                }
            }
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        // Genuine processing failure: return 5xx so Razorpay retries instead of
        // silently dropping a captured payment.
        console.error('Webhook Error:', error);
        res.status(500).json({ status: 'error' });
    }
};
