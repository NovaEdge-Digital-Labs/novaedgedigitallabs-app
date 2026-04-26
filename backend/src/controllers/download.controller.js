const Product = require('../models/Product.model');
const Purchase = require('../models/Purchase.model');
const axios = require('axios');

// Securely serve the product zip file
exports.downloadProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        // 1. Verify Purchase
        const purchase = await Purchase.findOne({
            userId,
            productId,
            status: 'completed'
        });

        if (!purchase) {
            return res.status(403).json({ success: false, message: 'You must purchase this product to download it' });
        }

        // 2. Get Product Info
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // 3. Proxy the download from Cloudinary
        // We use axios to get the file stream and pipe it to the response
        console.log(`Starting secure download for product: ${product.title}`);

        const response = await axios({
            method: 'GET',
            url: product.zipUrl,
            responseType: 'stream'
        });

        // Set headers for file download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${product.title.replace(/\s+/g, '_')}.zip"`);

        // Pipe the stream to response
        response.data.pipe(res);

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ success: false, message: 'Error processing download' });
    }
};
