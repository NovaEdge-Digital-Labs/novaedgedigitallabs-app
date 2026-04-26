const Product = require('../models/Product.model');
const Purchase = require('../models/Purchase.model');
const Review = require('../models/Review.model');

// Get all products (Public)
exports.getAllProducts = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { isActive: true };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: true, message: error.message });
    }
};

// Get single product details (Public)
exports.getProductDetails = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Get reviews
        const reviews = await Review.find({ productId: product._id }).populate('userId', 'name').sort({ createdAt: -1 });

        // Check if current user has purchased (if logged in)
        let isPurchased = false;
        if (req.user) {
            const purchase = await Purchase.findOne({ userId: req.user._id, productId: product._id, status: 'completed' });
            isPurchased = !!purchase;
        }

        res.status(200).json({
            success: true,
            data: { ...product.toObject(), reviews, isPurchased }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Submit a review (Protected - Buyers only)
exports.submitReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;
        const userId = req.user._id;

        // Check if purchased
        const purchase = await Purchase.findOne({ userId, productId, status: 'completed' });
        if (!purchase) {
            return res.status(403).json({ success: false, message: 'Only buyers can review products' });
        }

        const review = await Review.findOneAndUpdate(
            { productId, userId },
            { rating, comment },
            { new: true, upsert: true }
        );

        // Update product average rating
        const reviews = await Review.find({ productId });
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Product.findByIdAndUpdate(productId, { averageRating: avg });

        res.status(200).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
