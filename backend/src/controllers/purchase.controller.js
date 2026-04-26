const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Product = require('../models/Product.model');
const Purchase = require('../models/Purchase.model');

// Create a Razorpay order
exports.createOrder = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check if already purchased
        const existingPurchase = await Purchase.findOne({
            userId: req.user._id,
            productId,
            status: 'completed'
        });

        if (existingPurchase) {
            return res.status(400).json({ success: false, message: 'Product already purchased' });
        }

        const options = {
            amount: product.price * 100, // Razorpay works in paise
            currency: 'INR',
            receipt: `prod_${productId}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Save pending purchase
        await Purchase.create({
            userId: req.user._id,
            productId,
            amount: product.price,
            razorpayOrderId: order.id,
            status: 'pending'
        });

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify payment signature
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Update purchase record
            const purchase = await Purchase.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: 'completed'
                },
                { new: true }
            );

            // Increment sales count on product
            await Product.findByIdAndUpdate(purchase.productId, { $inc: { totalSales: 1 } });

            res.status(200).json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user purchases
exports.getUserPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find({
            userId: req.user._id,
            status: 'completed'
        }).populate('productId').sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: purchases });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
