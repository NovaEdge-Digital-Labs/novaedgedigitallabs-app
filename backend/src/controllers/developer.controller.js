const ApiKey = require('../models/ApiKey.model');
const ApiCallLog = require('../models/ApiCallLog.model');
const User = require('../models/User.model');

/**
 * @desc    Get current API key for the user
 * @route   GET /api/developer/key
 * @access  Private (Business)
 */
exports.getApiKey = async (req, res, next) => {
    try {
        let apiKey = await ApiKey.findOne({ userId: req.user.id, isActive: true });

        // If user is business or admin and has no key, generate one automatically
        if (!apiKey && (req.user.plan === 'business' || req.user.role === 'admin')) {
            apiKey = await ApiKey.create({
                userId: req.user.id,
                key: ApiKey.generateKey()
            });
        }

        if (!apiKey) {
            return res.status(404).json({ success: false, message: 'No API Key found or not eligible' });
        }

        res.status(200).json({
            success: true,
            apiKey: apiKey.key,
            quota: {
                used: apiKey.monthlyCalls,
                limit: apiKey.monthlyLimit
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Regenerate API key
 * @route   POST /api/developer/key/regenerate
 * @access  Private (Business)
 */
exports.regenerateApiKey = async (req, res, next) => {
    try {
        if (req.user.plan !== 'business' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Developer API is for Business plan only' });
        }

        // Deactivate current key
        await ApiKey.updateMany({ userId: req.user.id }, { isActive: false });

        // Create new key
        const newKey = await ApiKey.create({
            userId: req.user.id,
            key: ApiKey.generateKey()
        });

        res.status(201).json({
            success: true,
            apiKey: newKey.key,
            message: 'API Key regenerated successfully. Old keys are now inactive.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get API usage analytics
 * @route   GET /api/developer/stats
 * @access  Private (Business)
 */
exports.getApiUsageStats = async (req, res, next) => {
    try {
        const apiKey = await ApiKey.findOne({ userId: req.user.id, isActive: true });
        if (!apiKey) {
            return res.status(404).json({ success: false, message: 'No active API Key' });
        }

        // Breakdown by tool (endpoint)
        const stats = await ApiCallLog.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: '$endpoint',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Recent call history
        const history = await ApiCallLog.find({ userId: req.user.id })
            .sort({ timestamp: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            stats: {
                monthlyCalls: apiKey.monthlyCalls,
                monthlyLimit: apiKey.monthlyLimit,
                totalCalls: apiKey.totalCalls,
                toolBreakdown: stats
            },
            history
        });
    } catch (error) {
        next(error);
    }
};

const razorpay = require('../config/razorpay');
const crypto = require('crypto');

/**
 * @desc    Create Razorpay Order for API Plan
 * @route   POST /api/developer/subscribe
 * @access  Private
 */
exports.createSubscriptionOrder = async (req, res, next) => {
    try {
        const { plan, amount, quota } = req.body;
        
        // Amount should be in paise
        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `api_receipt_${req.user.id}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        
        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Render Razorpay Web Checkout
 * @route   GET /api/developer/checkout/:orderId
 * @access  Public
 */
exports.renderCheckout = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        // In a real app we'd fetch order details, but for now we pass the ID.
        // We need a dummy HTML page that runs razorpay checkout.
        
        const html = `
        <!DOCTYPE html>
        <html>
        <head><title>NovaEdge Secure Checkout</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="background:#000; color:#fff; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;">
            <div style="text-align:center;">
                <h2>NovaEdge API Checkout</h2>
                <p>Order ID: ${orderId}</p>
                <button id="rzp-button1" style="padding:10px 20px; background:#4CC38A; color:#000; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">Pay ₹499 Now</button>
            </div>
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            <script>
                var options = {
                    "key": "${process.env.RAZORPAY_KEY_ID}",
                    "amount": "49900", // 499 INR
                    "currency": "INR",
                    "name": "NovaEdge Digital Labs",
                    "description": "Pro API Subscription",
                    "order_id": "${orderId}",
                    "handler": function (response){
                        // Redirect back to app with payment details
                        window.location.href = "novaedge://payment-success?payment_id=" + response.razorpay_payment_id + "&order_id=" + response.razorpay_order_id + "&signature=" + response.razorpay_signature;
                    },
                    "theme": {
                        "color": "#8B7CF6"
                    }
                };
                var rzp1 = new Razorpay(options);
                document.getElementById('rzp-button1').onclick = function(e){
                    rzp1.open();
                    e.preventDefault();
                }
                // Auto open
                setTimeout(() => rzp1.open(), 500);
            </script>
        </body>
        </html>
        `;
        res.send(html);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify payment and update quota
 * @route   POST /api/developer/verify-payment
 * @access  Private
 */
exports.verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, quotaToAdd } = req.body;
        
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");
            
        if (razorpay_signature === expectedSign) {
            let apiKey = await ApiKey.findOne({ userId: req.user.id, isActive: true });
            
            if (!apiKey) {
                apiKey = await ApiKey.create({
                    userId: req.user.id,
                    key: ApiKey.generateKey(),
                    monthlyLimit: quotaToAdd
                });
            } else {
                apiKey.monthlyLimit += quotaToAdd;
                await apiKey.save();
            }
            
            return res.status(200).json({
                success: true,
                message: 'Payment verified successfully. API Quota upgraded!',
                newLimit: apiKey.monthlyLimit
            });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        next(error);
    }
};
