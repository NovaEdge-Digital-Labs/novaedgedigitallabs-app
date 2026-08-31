const razorpay = require('../config/razorpay');
const { verifySignature, assertOrderPaid } = require('../utils/payments');
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

        if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        // Bind the payment to this user's own pending order. Without the userId
        // scope one payment could be replayed onto other accounts; without the
        // 'pending' status it could be replayed onto this one, re-incrementing
        // the product's sales count each time.
        const pending = await Purchase.findOne({
            razorpayOrderId: razorpay_order_id,
            userId: req.user._id || req.user.id,
            status: 'pending'
        });

        if (!pending) {
            return res.status(409).json({ success: false, message: 'No pending order found for this payment' });
        }

        // Purchase.amount is stored in rupees; Razorpay reports paise.
        const paid = await assertOrderPaid(razorpay_order_id, Math.round(pending.amount * 100));
        if (!paid.ok) {
            return res.status(400).json({ success: false, message: paid.reason });
        }

        const purchase = await Purchase.findOneAndUpdate(
            { _id: pending._id, status: 'pending' },
            {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: 'completed'
            },
            { new: true }
        );

        if (!purchase) {
            return res.status(409).json({ success: false, message: 'This payment was already processed' });
        }

        const product = await Product.findByIdAndUpdate(
            purchase.productId,
            { $inc: { totalSales: 1 } },
            { new: true }
        );

        const User = require('../models/User.model');
        const user = await User.findById(purchase.userId);

        // Send Email Invoice
        try {
            const sendInvoice = require('../utils/sendInvoice');
            await sendInvoice({
                user: {
                    name: user.name,
                    email: user.email
                },
                purchaseType: 'product',
                itemDetails: {
                    name: product.name,
                    price: purchase.amount
                },
                paymentDetails: {
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    date: purchase.updatedAt
                }
            });
        } catch (mailError) {
            console.error('Failed to send product invoice email:', mailError);
        }

        res.status(200).json({ success: true, message: 'Payment verified successfully' });
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
